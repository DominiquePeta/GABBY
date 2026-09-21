import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../lib/supabase';
import {
  DriverPickOption,
  DriverProfile,
  DriverReview,
  DriverVerification,
  IncomingRequest,
  Nomination,
  Profile,
  Role,
  RideRequest,
} from './types';

// ── Auth + profile ──────────────────────────────────────────────

export async function signUp(email: string, password: string, role: Role, name: string, phone: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  const userId = data.user?.id;
  if (!userId) throw new Error('Sign-up succeeded but no user id was returned.');
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({ id: userId, role, name, phone });
  if (profileError) throw profileError;
  if (role === 'driver') {
    const { error: dpError } = await supabase.from('driver_profiles').insert({ profile_id: userId });
    if (dpError) throw dpError;
  }
  return userId;
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getMyProfile(): Promise<Profile | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', auth.user.id).single();
  if (error) return null;
  return data as Profile;
}

// ── Photo upload ────────────────────────────────────────────────

async function uploadPhoto(bucket: 'profile-photos' | 'licence-photos', userId: string, localUri: string) {
  const ext = localUri.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;
  const base64 = await FileSystem.readAsStringAsync(localUri, { encoding: 'base64' });
  const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
  const { error } = await supabase.storage.from(bucket).upload(path, decode(base64), { contentType });
  if (error) throw error;
  return path;
}

export function uploadProfilePhoto(userId: string, localUri: string) {
  return uploadPhoto('profile-photos', userId, localUri);
}

export function uploadLicencePhoto(userId: string, localUri: string) {
  return uploadPhoto('licence-photos', userId, localUri);
}

export function getPublicPhotoUrl(path: string | null | undefined) {
  if (!path) return null;
  return supabase.storage.from('profile-photos').getPublicUrl(path).data.publicUrl;
}

// ── Driver profile + verification ──────────────────────────────

export async function getMyDriverProfile(userId: string): Promise<DriverProfile | null> {
  const { data, error } = await supabase
    .from('driver_profiles')
    .select('*')
    .eq('profile_id', userId)
    .single();
  if (error) return null;
  return data as DriverProfile;
}

export async function updateMyDriverProfile(userId: string, fields: Partial<DriverProfile>) {
  const { error } = await supabase.from('driver_profiles').update(fields).eq('profile_id', userId);
  if (error) throw error;
}

export async function submitForVerification(userId: string, licenceNumber: string, licencePhotoPath: string) {
  const { error } = await supabase.from('driver_verification').upsert({
    profile_id: userId,
    licence_number: licenceNumber,
    licence_photo_path: licencePhotoPath,
    status: 'pending',
    submitted_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function getMyVerification(userId: string): Promise<DriverVerification | null> {
  const { data, error } = await supabase
    .from('driver_verification')
    .select('*')
    .eq('profile_id', userId)
    .single();
  if (error) return null;
  return data as DriverVerification;
}

export function setAvailability(userId: string, available: boolean) {
  return updateMyDriverProfile(userId, { available });
}

// ── Browse ───────────────────────────────────────────────────────

export async function listVerifiedDrivers(opts: { query?: string; area?: string | null }) {
  let q = supabase
    .from('driver_profiles')
    .select('*, profiles!driver_profiles_profile_id_fkey(name)')
    .eq('verified', true);
  if (opts.area) q = q.contains('areas', [opts.area]);
  const { data, error } = await q;
  if (error) throw error;
  let list = (data ?? []).map((row: any) => ({ ...row, name: row.profiles?.name ?? '' })) as DriverProfile[];
  if (opts.query) {
    const needle = opts.query.trim().toLowerCase();
    list = list.filter(
      (d) => (d.name ?? '').toLowerCase().includes(needle) || d.areas.join(' ').toLowerCase().includes(needle)
    );
  }
  return list;
}

export async function getDriverProfileById(profileId: string): Promise<DriverProfile | null> {
  const { data, error } = await supabase
    .from('driver_profiles')
    .select('*, profiles!driver_profiles_profile_id_fkey(name)')
    .eq('profile_id', profileId)
    .single();
  if (error) return null;
  return { ...(data as any), name: (data as any).profiles?.name ?? '' };
}

export async function getDriverReviews(driverId: string): Promise<DriverReview[]> {
  const { data, error } = await supabase.rpc('get_driver_reviews', { p_driver_id: driverId });
  if (error) throw error;
  return (data ?? []) as DriverReview[];
}

export async function pickAnyAvailableDriver(area: string | null): Promise<DriverProfile | null> {
  let q = supabase
    .from('driver_profiles')
    .select('*, profiles!driver_profiles_profile_id_fkey(name)')
    .eq('verified', true)
    .eq('available', true);
  if (area) q = q.contains('areas', [area]);
  const { data, error } = await q;
  if (error || !data || data.length === 0) return null;
  const pick = data[Math.floor(Math.random() * data.length)] as any;
  return { ...pick, name: pick.profiles?.name ?? '' };
}

// ── Ride requests ────────────────────────────────────────────────

export async function createRideRequest(fields: {
  clientId: string;
  driverId: string;
  pickup: string;
  dropoff: string;
  shareTrip: boolean;
}): Promise<RideRequest> {
  const { data, error } = await supabase
    .from('ride_requests')
    .insert({
      client_id: fields.clientId,
      driver_id: fields.driverId,
      pickup: fields.pickup,
      dropoff: fields.dropoff,
      share_trip: fields.shareTrip,
      status: 'pending',
    })
    .select()
    .single();
  if (error) throw error;
  return data as RideRequest;
}

export async function getRideRequest(id: string): Promise<RideRequest | null> {
  const { data, error } = await supabase.from('ride_requests').select('*').eq('id', id).single();
  if (error) return null;
  return data as RideRequest;
}

export function subscribeToRideRequest(id: string, onChange: (r: RideRequest) => void) {
  const channel = supabase
    .channel(`ride_request_${id}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'ride_requests', filter: `id=eq.${id}` },
      (payload) => onChange(payload.new as RideRequest)
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

export async function listIncomingRequests(driverId: string): Promise<IncomingRequest[]> {
  const { data, error } = await supabase.rpc('list_incoming_requests', { p_driver_id: driverId });
  if (error) throw error;
  return (data ?? []) as IncomingRequest[];
}

export function subscribeToIncomingRequests(driverId: string, onChange: () => void) {
  const channel = supabase
    .channel(`incoming_requests_${driverId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'ride_requests', filter: `driver_id=eq.${driverId}` },
      () => onChange()
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

export async function cancelRideRequest(id: string) {
  const { error } = await supabase.from('ride_requests').update({ status: 'cancelled' }).eq('id', id);
  if (error) throw error;
}

export async function respondToRequest(id: string, status: 'accepted' | 'declined') {
  const fields: Record<string, unknown> = { status };
  if (status === 'accepted') fields.accepted_at = new Date().toISOString();
  const { error } = await supabase.from('ride_requests').update(fields).eq('id', id);
  if (error) throw error;
}

export async function getActiveClientRequest(clientId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('ride_requests')
    .select('id')
    .eq('client_id', clientId)
    .in('status', ['pending', 'accepted'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data.id as string;
}

export async function getActiveRideForDriver(driverId: string): Promise<RideRequest | null> {
  const { data, error } = await supabase
    .from('ride_requests')
    .select('*')
    .eq('driver_id', driverId)
    .eq('status', 'accepted')
    .order('accepted_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return data as RideRequest | null;
}

export async function completeRide(id: string) {
  const { error } = await supabase
    .from('ride_requests')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function getRideContact(requestId: string): Promise<{ name: string; phone: string } | null> {
  const { data, error } = await supabase.rpc('get_ride_contact', { request_id: requestId });
  if (error || !data || data.length === 0) return null;
  return data[0];
}

// ── Ratings ──────────────────────────────────────────────────────

export async function submitRating(fields: {
  rideRequestId: string;
  raterId: string;
  rateeId: string;
  stars: number;
  comment: string;
}) {
  const { error } = await supabase.from('ratings').insert({
    ride_request_id: fields.rideRequestId,
    rater_id: fields.raterId,
    ratee_id: fields.rateeId,
    stars: fields.stars,
    comment: fields.comment,
  });
  if (error) throw error;
}

// ── Admin ────────────────────────────────────────────────────────

export async function listPendingDrivers() {
  const { data, error } = await supabase
    .from('driver_verification')
    .select('*, profiles!driver_verification_profile_id_fkey(name)')
    .eq('status', 'pending')
    .order('submitted_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({ ...row, name: row.profiles?.name ?? '' }));
}

export function getLicencePhotoUrl(path: string) {
  return supabase.storage.from('licence-photos').createSignedUrl(path, 60 * 10);
}

// ── Nominations ──────────────────────────────────────────────────

export async function submitNomination(fields: {
  nominatedFirstName: string;
  nominatedSurname: string;
  isWomanConfirmed: boolean;
  contactPhone: string;
  contactEmail: string;
  nominatedById: string;
  nominatedByType: Role;
}) {
  const { error } = await supabase.from('nominations').insert({
    nominated_first_name: fields.nominatedFirstName,
    nominated_surname: fields.nominatedSurname,
    is_woman_confirmed: fields.isWomanConfirmed,
    contact_phone: fields.contactPhone || null,
    contact_email: fields.contactEmail || null,
    nominated_by_id: fields.nominatedById,
    nominated_by_type: fields.nominatedByType,
  });
  if (error) throw error;
}

export async function listOpenNominations(): Promise<Nomination[]> {
  const { data, error } = await supabase
    .from('nominations')
    .select('*')
    .in('status', ['pending', 'invited'])
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Nomination[];
}

export async function markNominationInvited(id: string) {
  const { error } = await supabase
    .from('nominations')
    .update({ status: 'invited', invited_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function markNominationDeclined(id: string) {
  const { error } = await supabase.from('nominations').update({ status: 'declined' }).eq('id', id);
  if (error) throw error;
}

export async function listDriversForLinking(query: string): Promise<DriverPickOption[]> {
  let q = supabase.from('profiles').select('id, name').eq('role', 'driver').order('name');
  if (query.trim()) q = q.ilike('name', `%${query.trim()}%`);
  const { data, error } = await q.limit(20);
  if (error) throw error;
  return (data ?? []) as DriverPickOption[];
}

export async function linkNominationToDriver(nominationId: string, driverId: string) {
  const { error } = await supabase
    .from('nominations')
    .update({ status: 'registered', linked_driver_id: driverId, registered_at: new Date().toISOString() })
    .eq('id', nominationId);
  if (error) throw error;
}

export async function reviewDriver(profileId: string, approve: boolean, adminId: string) {
  const { error: vErr } = await supabase
    .from('driver_verification')
    .update({
      status: approve ? 'approved' : 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminId,
    })
    .eq('profile_id', profileId);
  if (vErr) throw vErr;
  if (approve) {
    const { error: dpErr } = await supabase
      .from('driver_profiles')
      .update({ verified: true })
      .eq('profile_id', profileId);
    if (dpErr) throw dpErr;
  }
}

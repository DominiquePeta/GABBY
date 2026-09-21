export type Role = 'client' | 'driver' | 'admin';

export type Profile = {
  id: string;
  role: Role;
  name: string;
  phone: string;
  nominations_converted: number;
};

export type DriverProfile = {
  profile_id: string;
  bio: string;
  areas: string[];
  car_make_model: string;
  car_colour: string;
  car_plate: string;
  profile_photo_path: string | null;
  available: boolean;
  verified: boolean;
  rating_avg: number;
  rating_count: number;
  name?: string; // joined from profiles
};

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export type DriverVerification = {
  profile_id: string;
  licence_number: string;
  licence_photo_path: string;
  status: VerificationStatus;
  submitted_at: string;
};

export type DriverReview = {
  stars: number;
  comment: string;
  created_at: string;
  reviewer_display: string;
};

export type RideStatus = 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';

export type RideRequest = {
  id: string;
  client_id: string;
  driver_id: string;
  status: RideStatus;
  pickup: string;
  dropoff: string;
  share_trip: boolean;
  created_at: string;
};

export type NominationStatus = 'pending' | 'invited' | 'registered' | 'declined';

export type Nomination = {
  id: string;
  nominated_first_name: string;
  nominated_surname: string;
  is_woman_confirmed: boolean;
  contact_phone: string | null;
  contact_email: string | null;
  nominated_by_id: string | null;
  nominated_by_type: Role;
  status: NominationStatus;
  linked_driver_id: string | null;
  created_at: string;
};

export type DriverPickOption = {
  id: string;
  name: string;
};

export type IncomingRequest = {
  id: string;
  pickup: string;
  dropoff: string;
  created_at: string;
  client_id: string;
  client_name: string;
  client_rating_avg: number;
  client_rating_count: number;
};

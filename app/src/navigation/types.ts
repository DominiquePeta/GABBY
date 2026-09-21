export type AuthStackParamList = {
  Splash: undefined;
  Login: { role: 'client' | 'driver' | 'admin' };
  ClientSignup: undefined;
  DriverSignup: undefined;
};

export type ClientStackParamList = {
  Browse: undefined;
  DriverProfile: { driverId: string };
  Confirm: { driverId: string };
  Status: { requestId: string };
  Ride: { requestId: string };
  ClientRate: { requestId: string; driverId: string };
  ClientDone: undefined;
  NominationForm: undefined;
};

export type DriverStackParamList = {
  Onboarding: undefined;
  Awaiting: undefined;
  Dashboard: undefined;
  DriverRide: { requestId: string };
  DriverRate: { requestId: string; clientId: string };
  NominationForm: undefined;
};

export type AdminStackParamList = {
  AdminList: undefined;
};

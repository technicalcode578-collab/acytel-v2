import { createStore } from "solid-js/store";
import { UserProfile } from "../api/profile.service";

interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

const [profileState, setProfileState] = createStore<ProfileState>({
  profile: null,
  isLoading: false,
  error: null,
});

export function setProfile(profile: UserProfile) {
  setProfileState("profile", profile);
  setProfileState("error", null);
}

export function setLoading(loading: boolean) {
  setProfileState("isLoading", loading);
}

export function setError(error: string | null) {
  setProfileState("error", error);
}

export function clearProfile() {
  setProfileState({
    profile: null,
    isLoading: false,
    error: null,
  });
}

export default profileState;
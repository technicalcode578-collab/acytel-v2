import { Component, createSignal, createEffect, Show } from "solid-js";
import { Motion } from "solid-motion";
import { getUserProfile, updateUserProfile, UserProfile } from "../api/profile.service";
import { setProfile } from "../model/profile.store";
import authState, { setUser } from "../../auth/model/auth.store";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: Component<ProfileModalProps> = (props) => {
  const [profile, setLocalProfile] = createSignal<UserProfile | null>(null);
  const [displayName, setDisplayName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [saving, setSaving] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const userProfile = await getUserProfile();
      setLocalProfile(userProfile);
      setDisplayName(userProfile.displayName || "");
      setEmail(userProfile.email || "");
      setProfile(userProfile);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: Event) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const updatedProfile = await updateUserProfile({
        display_name: displayName(),
        email: email(),
      });

      setLocalProfile(updatedProfile);
      setProfile(updatedProfile);
      
      // Update auth store with new user info
      setUser({
        ...authState.user!,
        displayName: updatedProfile.displayName,
        email: updatedProfile.email,
      });

      props.onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  createEffect(() => {
    if (props.isOpen) {
      loadProfile();
    }
  });

  return (
    <Show when={props.isOpen}>
      <Motion
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={(e) => e.target === e.currentTarget && props.onClose()}
      >
        <Motion
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          class="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
        >
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-white">Profile Settings</h2>
            <button
              onClick={props.onClose}
              class="text-gray-400 hover:text-white transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <Show when={loading()}>
            <div class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          </Show>

          <Show when={!loading() && profile()}>
            <form onSubmit={handleSave} class="space-y-4">
              <Show when={profile()?.profilePicture}>
                <div class="flex justify-center mb-4">
                  <img
                    src={profile()?.profilePicture}
                    alt="Profile"
                    class="w-20 h-20 rounded-full object-cover"
                  />
                </div>
              </Show>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName()}
                  onInput={(e) => setDisplayName(e.currentTarget.value)}
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your display name"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email()}
                  onInput={(e) => setEmail(e.currentTarget.value)}
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div class="text-sm text-gray-400">
                <p>Account Type: {profile()?.authProvider === 'google' ? 'Google' : 'Local'}</p>
                <p>Joined: {new Date(profile()?.createdAt || '').toLocaleDateString()}</p>
              </div>

              <Show when={error()}>
                <div class="text-red-400 text-sm">{error()}</div>
              </Show>

              <div class="flex gap-3 pt-4">
                <Motion
                  component="button"
                  type="submit"
                  disabled={saving()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  class="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium disabled:opacity-50 transition"
                >
                  {saving() ? "Saving..." : "Save Changes"}
                </Motion>
                <button
                  type="button"
                  onClick={props.onClose}
                  class="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Show>
        </Motion>
      </Motion>
    </Show>
  );
};
import { Component, createSignal, Show } from "solid-js";
import { Motion } from "solid-motion";
import authState, { performLogout } from "../../../features/auth/model/auth.store";
import { ProfileModal } from "../../../features/profile/ui/ProfileModal";

export const UserMenu: Component = () => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [showProfileModal, setShowProfileModal] = createSignal(false);

  const handleLogout = async () => {
    await performLogout();
    setIsOpen(false);
  };

  return (
    <div class="relative">
      <button
        onClick={() => setIsOpen(!isOpen())}
        class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 transition"
      >
        <Show when={authState.user?.profilePicture} fallback={
          <div class="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {authState.user?.displayName?.[0] || authState.user?.email?.[0] || 'U'}
          </div>
        }>
          <img
            src={authState.user?.profilePicture}
            alt="Profile"
            class="w-8 h-8 rounded-full object-cover"
          />
        </Show>
        <span class="text-white text-sm font-medium truncate max-w-32">
          {authState.user?.displayName || authState.user?.email}
        </span>
      </button>

      <Show when={isOpen()}>
        <Motion
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          class="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg border border-gray-700 z-50"
        >
          <div class="py-1">
            <button
              onClick={() => {
                setShowProfileModal(true);
                setIsOpen(false);
              }}
              class="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition"
            >
              Profile Settings
            </button>
            <button
              onClick={handleLogout}
              class="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition"
            >
              Sign Out
            </button>
          </div>
        </Motion>
      </Show>

      <ProfileModal
        isOpen={showProfileModal()}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};
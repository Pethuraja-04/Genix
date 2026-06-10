import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiUserPlus,
  FiCheck,
  FiX,
  FiSearch,
  FiUsers,
  FiMail,
  FiClock,
  FiUser,
} from "react-icons/fi";
import {
  useProfileQuery,
  useSendConnectionRequestMutation,
  useAcceptConnectionRequestMutation,
  useRejectConnectionRequestMutation,
  useSearchUsersQuery,
} from "../../services/authApi";
import { useToast } from "../context/ToastContext";

const Profile = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const token = localStorage.getItem("token");

  const { data: profileData, isLoading: isProfileLoading } = useProfileQuery(undefined, {
    skip: !token,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchData, isLoading: isSearching } = useSearchUsersQuery(searchQuery, {
    skip: !token || searchQuery.trim().length < 2,
  });

  const [sendRequest, { isLoading: isSendingRequest }] = useSendConnectionRequestMutation();
  const [acceptRequest, { isLoading: isAcceptingRequest }] = useAcceptConnectionRequestMutation();
  const [rejectRequest, { isLoading: isRejectingRequest }] = useRejectConnectionRequestMutation();

  const handleSendRequest = async (email:any) => {
    try {
      await sendRequest({ email }).unwrap();
      showToast("Request Sent", `Connection request sent to ${email}`, "success");
    } catch (err) {
      showToast("Error", err.data?.message || "Failed to send request", "error");
    }
  };

  const handleAcceptRequest = async (requesterId) => {
    try {
      await acceptRequest({ requesterId }).unwrap();
      showToast("Request Accepted", "You are now connected!", "success");
    } catch (err) {
      showToast("Error", err.data?.message || "Failed to accept request", "error");
    }
  };

  const handleRejectRequest = async (requesterId) => {
    try {
      await rejectRequest({ requesterId }).unwrap();
      showToast("Request Declined", "Connection request declined.", "success");
    } catch (err) {
      showToast("Error", err.data?.message || "Failed to decline request", "error");
    }
  };

  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Loading profile...</p>
      </div>
    );
  }

  const profile = profileData?.data || {};
  const connections = profile.connections || [];
  const receivedRequests = profile.receivedRequests || [];
  const sentRequests = profile.sentRequests || [];

  // Filter search results to prevent showing already connected/requested users as actionable
  const searchResults = searchData?.data || [];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 font-sans pb-12">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800 bg-slate-950/40 backdrop-blur-md sticky top-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/tasks")}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border border-slate-800 hover:border-slate-700 hover:bg-slate-900/60 transition-all cursor-pointer"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Back to Tasks</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              My Profile & Connections
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* User Card */}
        <div className="p-6 rounded-2xl glass-panel-dark border border-slate-800 flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-black text-white text-3xl shadow-lg shadow-indigo-500/25">
            {profile.name ? profile.name.charAt(0).toUpperCase() : <FiUser />}
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-extrabold">{profile.name}</h2>
            <p className="text-slate-400 text-sm mt-1 flex items-center justify-center md:justify-start gap-2">
              <FiMail className="w-4 h-4" /> {profile.email}
            </p>
            <p className="text-slate-500 text-xs mt-1">
              Member since: {new Date(profile.timestamp).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-center bg-slate-900/40 border border-slate-800/80 px-4 py-2.5 rounded-xl min-w-[100px]">
              <span className="block text-xl font-bold text-indigo-400">{connections.length}</span>
              <span className="text-xs text-slate-500 font-semibold uppercase">Connections</span>
            </div>
            <div className="text-center bg-slate-900/40 border border-slate-800/80 px-4 py-2.5 rounded-xl min-w-[100px]">
              <span className="block text-xl font-bold text-yellow-400">{receivedRequests.length}</span>
              <span className="text-xs text-slate-500 font-semibold uppercase">Pending</span>
            </div>
          </div>
        </div>

        {/* Find Connections Section */}
        <div className="p-6 rounded-2xl glass-panel-dark border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-indigo-400">
            <FiUserPlus className="w-5 h-5" /> Find People to Connect With
          </h3>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
              <FiSearch className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Search by name or email (min 2 characters)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 pl-10 pr-4 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-indigo-500 focus:outline-none text-sm transition-all"
            />
          </div>

          {searchQuery.trim().length >= 2 && (
            <div className="mt-4 border-t border-slate-800/80 pt-4 space-y-3">
              {isSearching ? (
                <p className="text-sm text-slate-400">Searching...</p>
              ) : searchResults.length === 0 ? (
                <p className="text-sm text-slate-400">No users found.</p>
              ) : (
                searchResults.map((user) => {
                  const isAlreadyConnected = connections.some((c) => c._id === user._id);
                  const isSent = sentRequests.some((r) => r._id === user._id);
                  const isReceived = receivedRequests.some((r) => r._id === user._id);

                  return (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/30 border border-slate-800/50 hover:bg-slate-900/50 transition-all"
                    >
                      <div>
                        <h4 className="font-bold text-sm">{user.name}</h4>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>

                      {isAlreadyConnected ? (
                        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                          <FiCheck className="w-3 h-3" /> Connected
                        </span>
                      ) : isSent ? (
                        <span className="text-xs font-semibold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                          <FiClock className="w-3 h-3" /> Requested
                        </span>
                      ) : isReceived ? (
                        <button
                          onClick={() => handleAcceptRequest(user._id)}
                          className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                        >
                          Accept Request
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSendRequest(user.email)}
                          disabled={isSendingRequest}
                          className="flex items-center gap-1 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
                        >
                          <FiUserPlus className="w-3.5 h-3.5" /> Connect
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Two Column Section for Pending & Connections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pending Requests */}
          <div className="p-6 rounded-2xl glass-panel-dark border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-yellow-400">
              <FiClock className="w-5 h-5" /> Incoming Requests
            </h3>
            {receivedRequests.length === 0 ? (
              <p className="text-sm text-slate-500 font-medium">No pending connection requests.</p>
            ) : (
              <div className="space-y-3">
                {receivedRequests.map((requester) => (
                  <div
                    key={requester._id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/30 border border-slate-800/50"
                  >
                    <div>
                      <h4 className="font-bold text-sm">{requester.name}</h4>
                      <p className="text-xs text-slate-400">{requester.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(requester._id)}
                        disabled={isAcceptingRequest}
                        className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 transition-all cursor-pointer"
                        title="Accept"
                      >
                        <FiCheck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRejectRequest(requester._id)}
                        disabled={isRejectingRequest}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 transition-all cursor-pointer"
                        title="Decline"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Connected Users */}
          <div className="p-6 rounded-2xl glass-panel-dark border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-400">
              <FiUsers className="w-5 h-5" /> My Connections
            </h3>
            {connections.length === 0 ? (
              <p className="text-sm text-slate-500 font-medium">No connections yet. Try searching above!</p>
            ) : (
              <div className="space-y-3">
                {connections.map((friend) => (
                  <div
                    key={friend._id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/30 border border-slate-800/50 hover:bg-slate-900/50 transition-all"
                  >
                    <div>
                      <h4 className="font-bold text-sm">{friend.name}</h4>
                      <p className="text-xs text-slate-400">{friend.email}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">Connected</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;

'use client';
console.log("Stream API Key is:", import.meta.env.VITE_STREAM_API_KEY);

import { ReactNode, useEffect, useState, useRef } from 'react';
import { StreamVideoClient, StreamVideo } from '@stream-io/video-react-sdk';
import { StreamChat } from 'stream-chat';
import { Chat } from 'stream-chat-react';
import { useAuthContext } from '../authContext';

import { tokenProvider } from '../actions/stream.actions';
import Loader from '../components/loader';

const API_KEY = import.meta.env.VITE_STREAM_API_KEY;


const StreamVideoProvider = ({ children }: { children: ReactNode }) => {



  useEffect(() => {
    (async () => {
      const tok = await tokenProvider();
      console.log("Stream token is:", tok);
    })();
  }, []);

  // Use refs to store stable references to clients
  const clientsRef = useRef<{
    videoClient: StreamVideoClient | null;
    chatClient: StreamChat | null;
    initialized: boolean;
  }>({
    videoClient: null,
    chatClient: null,
    initialized: false,
  });

  // State to trigger renders when clients are ready
  const [clientsReady, setClientsReady] = useState(false);

  const { user, isAuthenticated } = useAuthContext();

  useEffect(() => {
    // Skip if already initialized or user not authenticated
    if (clientsRef.current.initialized || !isAuthenticated || !user) return;
    if (!API_KEY) throw new Error('Stream API key is missing');



    const initializeClients = async () => {
      // 1) fetch a real, signed JWT from your /stream/token endpoint
      const streamJwt = await tokenProvider();
      console.log("Stream JWT:", streamJwt);

      // 2) AUTHENTICATE STREAM CHAT
      const chatClient = StreamChat.getInstance(API_KEY);
      // pass the literal string, not the provider function:
      await chatClient.connectUser(
        { id: user._id, name: user.email },
        streamJwt
      );

      // 3) AUTHENTICATE STREAM VIDEO
      // don’t pass tokenProvider to constructor here
      const videoClient = new StreamVideoClient({
        apiKey: API_KEY,
        user: { id: user._id, name: user.email },
        token: streamJwt,
      });
      // now actually connect the user & set the token internally
      await videoClient.connectUser(
        { id: user._id, name: user.email },
        streamJwt
      );

      // 4) store and flag ready
      clientsRef.current = { chatClient, videoClient, initialized: true };

      setClientsReady(true);
    };

    initializeClients();

    // Cleanup function for component unmount only
    return () => {
      // Ensure we don't disconnect during re-renders
      if (clientsRef.current.initialized) {
        // Mark as uninitialized first to prevent race conditions
        clientsRef.current.initialized = false;

        // Safely disconnect clients
        const cleanup = async () => {
          try {
            // Use try-catch for each operation to prevent one failure from
            // blocking the other cleanup actions
            try {
              if (clientsRef.current.videoClient) {
                await clientsRef.current.videoClient.disconnectUser();
                clientsRef.current.videoClient = null;
              }
            } catch (e) {
              console.error("Error disconnecting video client:", e);
            }

            try {
              if (clientsRef.current.chatClient) {
                await clientsRef.current.chatClient.disconnectUser();
                clientsRef.current.chatClient = null;
              }
            } catch (e) {
              console.error("Error disconnecting chat client:", e);
            }
          } catch (e) {
            console.error("Cleanup error:", e);
          }
        };

        cleanup();
      }
    };
  }, [user, isAuthenticated]);

  // Show loader until clients are ready
  if (!clientsReady || !clientsRef.current.videoClient || !clientsRef.current.chatClient) {
    return <Loader />;
  }

  // Get the stable references to clients from the ref
  const { videoClient, chatClient } = clientsRef.current;

  return (
    <Chat client={chatClient}>
      <StreamVideo client={videoClient}>
        {children}
      </StreamVideo>
    </Chat>
  );
};

export default StreamVideoProvider; 
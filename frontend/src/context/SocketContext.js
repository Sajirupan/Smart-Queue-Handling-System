"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL);
        
        newSocket.on('connect', () => {
            console.log('Connected to socket server');
        });

        newSocket.on('queue_updated', (queue) => {
            // Can be caught by specific components, but we can also have a generic toast if needed
            // toast(`Queue updated: ${queue.tokenNumber} is now ${queue.status}`, { icon: '🔄' });
        });

        newSocket.on('call_customer', (data) => {
            toast(`Calling Token ${data.token} to ${data.counter}`, {
                icon: '📢',
                duration: 6000,
                style: {
                    background: '#1e293b',
                    color: '#fff',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                }
            });
            
            // Text to speech announcement
            const msg = new SpeechSynthesisUtterance();
            msg.text = `Token number ${data.token}, please proceed to ${data.counter}`;
            window.speechSynthesis.speak(msg);
        });

        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);

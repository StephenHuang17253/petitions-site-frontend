import create from 'zustand';
import {persist} from "zustand/middleware";

type User = {
    token: string | null;
    userId: string | null;
    isAuthenticated: boolean;

};

type AuthActions = {
    userLogin: (token: string, userId: string) => void;
    userLogout: () => void;
};

const useAuthStore = create<User & AuthActions>()(
    persist((set, get) => ({
            token: null,
            userId: null,
            isAuthenticated: false,
            userLogin: (token, userId) => set({ token, userId, isAuthenticated: true }),
            userLogout: () => set({ token: null, userId: null, isAuthenticated: false })
        }),
        { name: 'auth'}
    )
);

export default useAuthStore;

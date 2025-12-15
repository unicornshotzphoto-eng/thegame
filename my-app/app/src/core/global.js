import { create } from 'zustand'

const useStore = create((set) => ({
 //----------------
 // Authentication
 //----------------

 authenticated: false,
 user: {},
 login: (user) => {
   console.log('========== ZUSTAND LOGIN CALLED ==========');
   console.log('User data:', user);
   set({
     authenticated: true,
     user: user
   });
   console.log('State after set:', useStore.getState());
   console.log('========== ZUSTAND LOGIN COMPLETE ==========');
 },

logout: () => {
  console.log('========== ZUSTAND LOGOUT CALLED ==========');
  set({
    authenticated: false,
    user: {}
  });
  console.log('State after logout:', useStore.getState());
  console.log('========== ZUSTAND LOGOUT COMPLETE ==========');
}
}))

export default useStore;
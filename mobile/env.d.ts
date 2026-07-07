/// <reference types="expo/types" />


declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: string;
    EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
  }
}

declare module '*.css' {
  const content: any;
  export default content;
}

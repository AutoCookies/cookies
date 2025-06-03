console.log(">>> DEBUG ENV VARS - process.env:", process.env);
console.log(">>> DEBUG NEXT_PUBLIC_API_ROUTE:", process.env.NEXT_PUBLIC_API_ROUTE);

export const ENV_VARS = {
    API_ROUTE: process.env.NEXT_PUBLIC_API_ROUTE,
    PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL
};

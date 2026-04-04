import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Mock authorization for Super Prompt demonstration
        if (credentials?.email === "admin@smilecare.com" && credentials?.password === "admin") {
          return { id: "1", name: "Dr. Smith", email: "admin@smilecare.com", role: "Admin" };
        }
        return null;
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // @ts-expect-error role is added in Authorize
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: { // Optional custom login page
    // signIn: '/login'
  }
});

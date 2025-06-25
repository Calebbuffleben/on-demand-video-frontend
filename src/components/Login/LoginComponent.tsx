import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

const LoginComponent = () => (
  <>
    <SignedOut>
      <SignInButton />
    </SignedOut>
    <SignedIn>
      <UserButton />
    </SignedIn>
  </>
);

export default LoginComponent;

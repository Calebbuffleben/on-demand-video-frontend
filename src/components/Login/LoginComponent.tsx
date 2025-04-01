import { ChangeEvent, FormEvent } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

type TLogin = {
  onChangeValues: (event: ChangeEvent<HTMLInputElement>) => void;
  handleLogin: (event: FormEvent<HTMLFormElement>) => void;
  email: string;
  password: string;
};

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

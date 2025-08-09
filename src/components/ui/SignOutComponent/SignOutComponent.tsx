'use client'
import { useAppAuth } from '@/contexts/AppAuthContext'

const SignOutComponent = () => {
  const { logout } = useAppAuth()

  return (
    // Clicking this button signs out a user
    // and redirects them to the home page "/".
    <button onClick={() => logout()}>Sign out</button>
  )
}

export default SignOutComponent;

import { SignIn } from "@clerk/nextjs";

export default function TestClerkPage() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div>
        <h1>Testing Clerk</h1>
        <SignIn />
      </div>
    </div>
  );
} 
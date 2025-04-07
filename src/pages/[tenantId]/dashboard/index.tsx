'use client'

import subscriptionService from "@/api-connection/subscriptions";
import SignOutComponent from "@/components/ui/SignOutComponent/SignOutComponent";
import { useEffect, useState } from "react";

const DashboardPage = () => {
    //get the subscription and store it in the state
    const [subscription, setSubscription] = useState<null | any>(null);

   
    

    const fetchSubscription = async () => {
        const subscription = await subscriptionService.getCurrentSubscription();
        setSubscription(subscription);
    } 

    return (
        <div>
            <h1>Dashboard</h1>
            <SignOutComponent />

             <div>
                <h2>Subscription</h2>
                
            </div> 
        </div>
    )
}

export default DashboardPage;
import { useEffect } from "react";


export default function  EmilConfirmation(){


    return(
        <div class="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8"> 
            <div class="text-center space-y-5">
            <p
                class="mt-1 text-4xl font-extrabold text-gray-900 dark:text-gray-100 sm:text-5xl sm:tracking-tight lg:text-6xl">
                Your account is now
                <span class="px-2 py-1 relative inline-block"><svg class="stroke-current bottom-0 absolute text-green-500 -translate-x-2" viewBox="0 0 410 18" xmlns="http://www.w3.org/2000/svg"><path d="M6 6.4c16.8 16.8 380.8-11.2 397.6 5.602" stroke-width="12" fill="none" fill-rule="evenodd" stroke-linecap="round"></path></svg><span class="relative">verified</span></span>
            </p>
            <p class="max-w-3xl mt-5 mx-auto text-xl text-gray-500 dark:text-gray-300">Take the leap and unleash your
                capabilities. Experience
                one week of unlimited access on us and witness the transformation.</p>
            {/* <a href="#"
                class="inline-block px-6 py-3 mt-8 bg-green-500 dark:bg-green-400 text-white font-semibold rounded hover:bg-green-600 dark:hover:bg-green-600">
                Back to log
            </a> */}
            </div> 
        </div>

    );
}
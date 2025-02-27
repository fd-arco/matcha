import { useState, useEffect } from "react";

export default function WelcomeModal(){

    return (
      <div
      className="fixed inset-0 bg-gray-800 bg-opacity-60 overflow-y-auto h-full w-full z-10"
      id="cookie-modal"
      role="dialog"
      aria-modal="true"
      >
            <div className="relative top-20 mx-auto p-4 md:p-6 border w-3/4 m-10 md:w-96 shadow-lg rounded-lg bg-white z-50">
              <div className="text-center">
              <div class="transition-colors duration-300">
             
                          <div class="spinner-card bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg flex flex-col items-center space-y-4">
                              <h2 class="font-semibold  text-lg dark:text-white">An email has been sent to verify your account</h2>
                              <div class="border-4 rounded-full w-12 h-12 spinner-circle"></div>
                          </div>
                      </div>
                <div className="mt-4 px-4 py-3">
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    With the verification of your account you may acces to more features.
                  </p>
                </div>
              </div>
            </div>
          </div>
      );
}
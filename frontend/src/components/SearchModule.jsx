import React from "react";
import { useState, useEffect } from "react";
import {useFilters} from "../context/FilterContext"
import UpdateModal from "./UpdateModal";
import { useUser } from "../context/UserContext";
import { useGeo } from "../context/GeoContext";

const SearchModule = () => {
    // const [ageGap, setAgeGap] = useState([18, 100]);
    // const [fameRating, setFameRating] = useState(0);
    // const [distanceMax, setdistanceMax] = useState(50);
    // const [tagsInCommon, setTagsInCommon] = useState(0);

    const [ageGap, setAgeGap] = useState(() => {
        const stored = localStorage.getItem('ageGap');
        return stored ? JSON.parse(stored) : [18, 100];
    });
    const [fameRating, setFameRating] = useState(() => {
        const stored = localStorage.getItem('fameRating');
        return stored ? Number(stored) : 0;
    });
    const [tagsInCommon, setTagsInCommon] = useState(() => {
        const stored = localStorage.getItem('tagsInCommon');
        return stored ? Number(stored) : 0;
    });
    const [distanceMax, setdistanceMax] = useState(() => {
        const stored = localStorage.getItem('distanceMax');
        return stored ? Number(stored) : 500;
    });
    

    const [error, setError] = useState('');
    const [matchingProfilesCount, setMatchingProfilesCount] = useState(0);
    const {setFilters} = useFilters();
    const {canMatch} = useGeo();
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    const {userId} = useUser();

    useEffect(() => {
        if (ageGap[0] > ageGap[1]) return;

        const fetchMatchingCount = async() => {
            try {
                const res = await fetch(`http://localhost:3000/profile/profiles-count?userId=${userId}&ageMin=${ageGap[0]}&ageMax=${ageGap[1]}&fameMin=${fameRating}&tagsMin=${tagsInCommon}&distanceMax=${distanceMax}`, {
                    credentials:"include"
                });
                const data = await res.json();
                setMatchingProfilesCount(data.count);
            } catch (error) {
                console.error("Erereur lors du fetch du nombre de profils:", error);
            }
        }
        fetchMatchingCount();
    }, [ageGap, fameRating, tagsInCommon,distanceMax, userId]);

    const handleSubmit = () => {
        if (ageGap[0] > ageGap[1]) {
            setError("Minimum age must be less than or equal to maximum age.");
            return ;
        }
        const newFilters = {
            ageMin: ageGap[0],
            ageMax: ageGap[1],
            fameMin: fameRating,
            tagsMin: tagsInCommon,
            distanceMax: distanceMax,
        }
        setShowUpdateModal(true);
        setFilters(newFilters);
        //TODO: BACKEND REQUEST
    }
    
    useEffect(() => {
        localStorage.setItem('ageGap', JSON.stringify(ageGap));
    }, [ageGap]);
    
    useEffect(() => {
        localStorage.setItem('fameRating', fameRating);
    }, [fameRating]);
    
    useEffect(() => {
        localStorage.setItem('tagsInCommon', tagsInCommon);
    }, [tagsInCommon]);

    useEffect(() => {
        localStorage.setItem('distanceMax', distanceMax);
    }, [distanceMax]);
    
    useEffect(() => {
        if (ageGap[0] <= ageGap[1]) {
            setError("");
        }
    }, [ageGap]);


    return (
       <div className="bg-white dark:bg-gray-900 flex p-6 gap-6 items-start">
            <div className="flex flex-col justify-center gap-3 p-4 w-3/5">
                <h2 className="text-2xl font-bold font-sans">Adjust your research</h2>
                <div className="flex flex-col gap-1  ">


                    <div className="flex flex-col flex-grow">
                        <label className="mb-2 text-lg font-semibold font-sans tracking-wide">Age range</label>
                        <span className="italic text-sm -mb-2.5">Age min</span>
                        <div className="flex flex-row items-center gap-4">
                            <input
                                type="range"
                                min={18}
                                max={100}
                                value={ageGap[0]}
                                onChange={(e) => setAgeGap([Number(e.target.value), ageGap[1]])}
                                className="w-full accent-green-500 dark:accent-green-800"
                            />
                            <span className="w-16 text-3xl font-extrabold font-mono text-green-500 dark:text-green-800 self-center">{ageGap[0]}</span>
                        </div>
                        {error && (
                            <span className="text-red-600 text-sm -mt-2">{error}</span>
                        )}
                    </div>

                    <div className="flex flex-col flex-grow border-b border-gray-300 pb-4 mb-4">
                        <span className="italic text-sm -mb-2.5">Age max</span>
                        <div className="flex flex-row items-center gap-4">
                            <input
                                type="range"
                                min={18}
                                max={100}
                                value={ageGap[1]}
                                onChange={(e) => setAgeGap([ageGap[0], Number(e.target.value)])}
                                className="w-full accent-green-500 dark:accent-green-800"
                            />
                            <span className="w-16 text-3xl font-extrabold font-mono text-green-500 dark:text-green-800 self-center">{ageGap[1]}</span>
                        </div>
                    </div>

                    <div className="flex flex-col flex-grow border-b border-gray-300 pb-4 mb-4">
                        <label className="mb-2 text-lg font-semibold font-sans tracking-wide">Fame</label>
                        <div className="flex flex-row items-center gap-4">
                            <input
                                type="range"
                                min={0}
                                max={1000}
                                value={fameRating}
                                onChange={(e) => setFameRating(Number(e.target.value))}
                                className="w-full accent-green-500 dark:accent-green-800"
                            />
                            <span className="w-16 text-3xl font-extrabold font-mono text-green-500 dark:text-green-800 self-center">{fameRating}</span>
                        </div>
                    </div>

                    <div className="flex flex-col flex-grow border-b border-gray-300 pb-4 mb-4">
                        <label className="mb-2 text-lg font-semibold font-sans tracking-wide">distanceMax (in kms)</label>
                        <div className="flex flex-row items-center gap-4">
                            <input
                                type="range"
                                min={1}
                                max={500}
                                value={distanceMax}
                                onChange={(e) => setdistanceMax(Number(e.target.value))}
                                className="w-full accent-green-500 dark:accent-green-800"
                            />
                            <span className="w-16 text-3xl font-extrabold font-mono text-green-500 dark:text-green-800 self-center">{distanceMax}</span>
                        </div>
                    </div>
                    <div className="flex flex-col flex-grow border-b border-gray-300 pb-4 mb-4">
                        <label className="mb-2 text-lg font-semibold font-sans tracking-wide">Common passions</label>
                        <div className="flex flex-row items-center gap-4">
                            <input
                                type="range"
                                min={0}
                                max={5}
                                value={tagsInCommon}
                                onChange={(e) => setTagsInCommon(Number(e.target.value))}
                                className="w-full accent-green-500 dark:accent-green-800"
                            />
                            <span className="w-16 text-3xl font-extrabold font-mono text-green-500 dark:text-green-800 self-center">{tagsInCommon}</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    className="mt-6 bg-green-500 hover:bg-green-400 dark:bg-green-800 dark:hover:bg-green-900 px-6 py-2 rounded-lg shadow"
                >
                    Save filters
                </button>
                {/* <button className="mt-6 bg-green-500 hover:bg-green-400 dark:bg-green-800 dark:hover:bg-green-900 px-6 py-2 rounded-lg shadow"
                onClick={resetFilters}
                >
                    Reset filters
                </button> */}
            </div>
            <div className="w-2/5 m-auto flex flex-col justify-center items-center bg-gray-200 dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <span className="text-7xl font-extrabold text-green-500 dark:text-green-800">{matchingProfilesCount}</span>
                <span className="text-md font-medium text-gray-600 dark:text-gray-300 mt-2">Number of profiles</span>
            </div>
            {showUpdateModal && (
                <UpdateModal onClose={() => setShowUpdateModal(false)} />
            )}
        </div>
    )
}

export default SearchModule;
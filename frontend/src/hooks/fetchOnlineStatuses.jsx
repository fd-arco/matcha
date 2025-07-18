export const fetchOnlineStatuses = async (userIds, setOnlineStatuses) => {
    if (!userIds || userIds.length === 0) return;

    const idsArray = Array.isArray(userIds) ? userIds : [userIds];
    try {
        const response = await fetch(`http://localhost:3000/misc/online-statuses?userIds=${idsArray.join(",")}`, {
            credentials:"include"
        });
        const data = await response.json();

        const newStatuses = {};
        data.forEach(({userId, online, lastOnline}) => {
            newStatuses[userId] = {online, lastOnline};
        });

        setOnlineStatuses(prev => ({
            ...prev,
            ...newStatuses
        }));
    } catch (error) {
        console.error("error fetching online statuses:", error);
    }
}
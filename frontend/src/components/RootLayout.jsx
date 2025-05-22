import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

export default function RootLayout({userId, setUserId, refreshFlag, setHasProfile}) {
  return (
    <>
      <Navbar userId={userId} setUserId={setUserId} refreshFlag={refreshFlag} setHasProfile={setHasProfile} />
      <div className="pt-[72px]">
        <Outlet />
      </div>
    </>
  )
}
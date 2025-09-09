import React, { useState, useEffect } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteField,
  query,
} from "firebase/firestore";
import { db } from "./firebase";
import "./App.css";

const STATUS_COLORS = {
  pass: "var(--color-pass)",
  fail: "var(--color-fail)",
  default: "var(--color-default)",
};

const statuses = [null, "pass", "fail"];

export default function App() {
  const [user, setUser] = useState(null);
  const [ramPassword, setRamPassword] = useState("");
  const [isRamLoggedIn, setIsRamLoggedIn] = useState(false);
  const [calendarData, setCalendarData] = useState({});
  const [physioResponse, setPhysioResponse] = useState(null);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const q = query(collection(db, "calendar"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data = {};
      snapshot.forEach((doc) => {
        data[doc.id] = doc.data();
      });
      setCalendarData(data);
    });
    return () => unsubscribe();
  }, []);

  const handleSelectUser = (name) => {
    setUser(name);
    if (name === "ram") setIsRamLoggedIn(false);
    setPhysioResponse(null);
  };

  const handleRamLogin = () => {
    if (ramPassword === "ram123") {
      setIsRamLoggedIn(true);
    } else {
      alert("Incorrect password for Ram");
    }
  };

  const handlePhysioResponse = async (response) => {
    const status = response === "yes" ? "pass" : "fail";
    try {
      await setDoc(
        doc(db, "calendar", today),
        {
          status,
          user: "sabrina",
          timestamp: new Date().toISOString(),
        },
        { merge: true }
      );
      setPhysioResponse(status);
      setUser("sabrina_calendar");
    } catch (e) {
      alert("Error saving response.");
    }
  };

  const toggleDayStatus = async (date) => {
    if (user !== "ram" || !isRamLoggedIn) return;
    const currentStatus = calendarData[date]?.status || null;
    const nextStatus =
      statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];
    try {
      const dayRef = doc(db, "calendar", date);
      if (nextStatus === null) {
        await updateDoc(dayRef, {
          status: deleteField(),
          user: "ram",
          timestamp: new Date().toISOString(),
        });
      } else {
        await setDoc(
          dayRef,
          {
            status: nextStatus,
            user: "ram",
            timestamp: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    } catch (e) {
      alert("Error toggling day status.");
    }
  };

  const getLast30Days = () => {
    const days = [];
    const todayDate = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  };

  const getColor = (date) => {
    const status = calendarData[date]?.status;
    return STATUS_COLORS[status] || STATUS_COLORS.default;
  };

  const DayBox = ({ date }) => {
    const color = getColor(date);
    return (
      <div
        className="day-box"
        title={date}
        onClick={() =>
          user === "ram" && isRamLoggedIn ? toggleDayStatus(date) : null
        }
        style={{ backgroundColor: color }}
      >
        {date.slice(8)}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="page">
        <div className="container">
          <h1>Select Account</h1>
          <button className="btn" onClick={() => handleSelectUser("ram")}>
            Ram (Password required)
          </button>
          <button className="btn" onClick={() => handleSelectUser("sabrina")}>
            Sabrina (No password)
          </button>
        </div>
      </div>
    );
  }

  if (user === "ram" && !isRamLoggedIn) {
    return (
      <div className="page">
        <div className="container">
          <h1>Ram Login</h1>
          <input
            className="input"
            type="password"
            placeholder="Enter password"
            value={ramPassword}
            onChange={(e) => setRamPassword(e.target.value)}
          />
          <button className="btn" onClick={handleRamLogin}>
            Login
          </button>
          <button className="btn" onClick={() => setUser(null)}>
            Back
          </button>
        </div>
      </div>
    );
  }

  if (user === "sabrina") {
    return (
      <div className="page">
        <div className="container">
          <h1>Have you done your physio today?</h1>
          <button className="btn" onClick={() => handlePhysioResponse("yes")}>
            Yes
          </button>
          <button className="btn" onClick={() => handlePhysioResponse("no")}>
            No
          </button>
          <button className="btn" onClick={() => setUser("sabrina_calendar")}>
            View Calendar
          </button>
          <button className="btn" onClick={() => setUser(null)}>
            Back
          </button>
        </div>
      </div>
    );
  }

  if ((user === "ram" && isRamLoggedIn) || user === "sabrina_calendar") {
    return (
      <div className="page">
        <div className="container">
          <h1>Shared Physio Calendar</h1>
          <div className="calendar">
            {getLast30Days().map((date) => (
              <DayBox key={date} date={date} />
            ))}
          </div>
          <button
            className="btn"
            onClick={() => {
              setUser(user === "ram" ? null : "sabrina");
              setIsRamLoggedIn(false);
              setPhysioResponse(null);
            }}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <h2>Something went wrong</h2>
        <button className="btn" onClick={() => setUser(null)}>
          Back
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const HomeNav = () => {
    const [scrolled, setScrolled] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "glass" : "bg-transparent"}`}
            style={{ padding: "1rem 0" }}
        >
            <div
                className="container"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
                <Link
                    href="/"
                    style={{
                        fontSize: "1.5rem",
                        fontWeight: "800",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    <span className="gradient-text">Fest event manager</span>
                </Link>

                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <button
                        className="btn-primary"
                        style={{ padding: "0.5rem 1rem", fontSize: "1rem" }}
                        onClick={() => router.push("/login")}
                    >
                        Login
                    </button>
                    <button
                        className="btn-secondary"
                        style={{ padding: "0.5rem 1rem", fontSize: "1rem" }}
                        onClick={() => router.push("/register")}
                    >
                        Sign Up
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default HomeNav;

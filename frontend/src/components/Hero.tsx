import React from "react";

const Hero = () => {
    return (
        <section
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                paddingTop: "120px",
                paddingBottom: "80px",
                textAlign: "center",
            }}
        >
            {}
            <div
                className="absolute-bg"
                style={{
                    position: "absolute",
                    top: "-10%",
                    left: "-10%",
                    width: "50vw",
                    height: "50vw",
                    background: "radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(15, 23, 42, 0) 70%)",
                    filter: "blur(80px)",
                    borderRadius: "50%",
                    animation: "float 8s ease-in-out infinite",
                    zIndex: 0,
                }}
            ></div>
            <div
                className="absolute-bg"
                style={{
                    position: "absolute",
                    bottom: "-20%",
                    right: "-10%",
                    width: "60vw",
                    height: "60vw",
                    background: "radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, rgba(15, 23, 42, 0) 70%)",
                    filter: "blur(100px)",
                    borderRadius: "50%",
                    animation: "float 10s ease-in-out infinite reverse",
                    zIndex: 0,
                }}
            ></div>

            <div className="container" style={{ position: "relative", zIndex: 1 }}>
                <h1
                    style={{
                        fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
                        marginBottom: "1.5rem",
                        letterSpacing: "-0.02em",
                        lineHeight: "1.1",
                    }}
                >
                    Elevate Your Events <br />
                    <span className="gradient-text">Beyond Imagination</span>
                </h1>

                <p
                    style={{
                        fontSize: "1.25rem",
                        color: "var(--color-text-dim)",
                        maxWidth: "800px",
                        margin: "0 auto 3rem auto",
                        lineHeight: "1.6",
                    }}
                >
                    Fest event manager is the all-in-one platform for planning, managing, and executing unforgettable
                    experiences. Seamlessly bringing your vision to life.
                </p>

                <div
                    style={{
                        display: "flex",
                        gap: "1rem",
                        justifyContent: "center",
                        marginBottom: "4rem",
                    }}
                >
                    <button className="btn-primary">Get Started</button>
                    <button className="btn-secondary">View Demo</button>
                </div>

                {}
                <div
                    style={{
                        position: "relative",
                        background: "rgba(30, 41, 59, 0.5)",
                        backdropFilter: "blur(20px)",
                        borderRadius: "20px",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        boxShadow: "0 50px 100px -20px rgba(0, 0, 0, 0.5)",
                        padding: "1rem",
                        maxWidth: "1000px",
                        margin: "0 auto",
                        transform: "perspective(1000px) rotateX(2deg)",
                        transformOrigin: "top center",
                    }}
                >
                    {}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            marginBottom: "1rem",
                            padding: "0 0.5rem",
                        }}
                    >
                        <div
                            style={{
                                width: "12px",
                                height: "12px",
                                borderRadius: "50%",
                                background: "#EF4444",
                            }}
                        ></div>
                        <div
                            style={{
                                width: "12px",
                                height: "12px",
                                borderRadius: "50%",
                                background: "#F59E0B",
                            }}
                        ></div>
                        <div
                            style={{
                                width: "12px",
                                height: "12px",
                                borderRadius: "50%",
                                background: "#10B981",
                            }}
                        ></div>
                        <div
                            style={{
                                flex: 1,
                                height: "28px",
                                background: "rgba(255, 255, 255, 0.05)",
                                borderRadius: "6px",
                                marginLeft: "1rem",
                            }}
                        ></div>
                    </div>

                    {}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "200px 1fr",
                            gap: "1rem",
                            height: "400px",
                        }}
                    >
                        {}
                        <div
                            style={{
                                background: "rgba(255, 255, 255, 0.02)",
                                borderRadius: "12px",
                                padding: "1rem",
                            }}
                        >
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div
                                    key={i}
                                    style={{
                                        height: "30px",
                                        background:
                                            i === 1 ? "rgba(99, 102, 241, 0.2)" : "transparent",
                                        borderRadius: "6px",
                                        marginBottom: "0.5rem",
                                    }}
                                ></div>
                            ))}
                        </div>

                        {}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateRows: "auto 1fr",
                                gap: "1rem",
                            }}
                        >
                            {}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(3, 1fr)",
                                    gap: "1rem",
                                }}
                            >
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        style={{
                                            height: "80px",
                                            background: "rgba(255, 255, 255, 0.02)",
                                            borderRadius: "12px",
                                            border: "1px solid rgba(255, 255, 255, 0.05)",
                                        }}
                                    ></div>
                                ))}
                            </div>
                            {}
                            <div
                                style={{
                                    background: "rgba(255, 255, 255, 0.02)",
                                    borderRadius: "12px",
                                    border: "1px solid rgba(255, 255, 255, 0.05)",
                                    position: "relative",
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: "60%",
                                        background:
                                            "linear-gradient(to top, rgba(99, 102, 241, 0.2), transparent)",
                                        clipPath:
                                            "polygon(0% 100%, 0% 80%, 20% 60%, 40% 70%, 60% 30%, 80% 50%, 100% 20%, 100% 100%)",
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;

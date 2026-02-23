import HomeNav from "../components/HomeNav";
import Hero from "../components/Hero";

const Home = () => {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: '#0f172a', color: 'rgba(255, 255, 255, 0.92)' }}>
      <HomeNav />
      <main>
        <Hero />
      </main>
    </div>
  );
};

export default Home;

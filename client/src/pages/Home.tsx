import HomeBackground from "../components/HomeBackground"
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import React from "react";

export default function Home() {
  return (
    <>
    {/* HERO SECTION */}
<div className="relative text-white overflow-hidden">

  {/* Mobile Gradient / Desktop Video wrapper */}
  <div className="relative w-full">

<div className="relative w-full h-screen overflow-hidden">
  <video
    src="/nexura-logo-mov.mp4"
    autoPlay
    loop
    muted
    playsInline
    className="absolute top-0 left-0 w-full h-full object-cover opacity-20"
  />
</div>



    {/* Top-left Logo */}
    <img
  src="/nexura-logo.png"
  alt="Nexura Logo"
  className="absolute top-6 left-4 w-24 sm:w-32 sm:top-12 sm:left-12 z-10"
/>


    <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 text-center z-10 h-screen">

  <motion.h1
    initial={{ y: -50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 1.8 }}
    className="font-geist text-2xl sm:text-4xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-6"
  >
    The <span className="text-purple-500 font-extrabold">Engagement</span> Engine For The Intuition{" "}
    <span className="block text-purple-500 font-extrabold">Ecosystem</span>
  </motion.h1>

  <motion.p
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.5, duration: 1.8 }}
    className="font-geist text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 font-bold mb-8 sm:mb-5 max-w-xs sm:max-w-2xl"
  >
    Build participation. Boost exploration. Reward contributions.
  </motion.p>

  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ delay: 1, type: "spring", stiffness: 100 }}
  >
    <Link href="/discover">
      <div className="relative inline-block">

{/* Button with subtle bounce */}
<motion.button
  className="px-8 sm:px-12 py-2 sm:py-2.5 border border-white bg-purple-600 text-white font-bold rounded-full text-sm sm:text-base relative z-10 shadow-md"
  animate={{ y: [0, -5, 0] }} // existing subtle bounce
  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
  whileHover={{
    scale: 1.05,                  // slightly bigger on hover
    rotate: [0, 2, -2, 0],        // subtle “thinking” wobble
    boxShadow: "0 0 20px rgba(124, 58, 237, 0.6)", // glow effect
  }}
>
  Launch App
</motion.button>

      </div>
    </Link>
  </motion.div>

      <div className="flex items-center justify-center space-x-3 sm:space-x-4 mt-3 sm:mt-5 py-3 px-3 sm:py-[14.4px] sm:px-[13.5px] rounded-[90px] border border-white/20">
  <a
    href="https://x.com/NexuraXYZ"
    target="_blank"
    rel="noopener noreferrer"
    className="cursor-pointer"
  >
    <img
      src="/x-logo.png"
      alt="X Logo"
      className="w-4 h-4 sm:w-6 sm:h-6"
    />
  </a>

  <div className="flex items-center space-x-2 sm:space-x-3">
    <div className="w-[1px] h-4 sm:h-6 bg-white" />
    <div className="w-[1px] h-4 sm:h-6 bg-white" />
  </div>

  <a
    href="https://discord.gg/bADTCtzyb"
    target="_blank"
    rel="noopener noreferrer"
    className="cursor-pointer"
  >
    <img
      src="/discord-logo.png"
      alt="Discord Logo"
      className="w-4 h-4 sm:w-6 sm:h-6"
    />
  </a>
</div>
    </div>
  </div>

  {/* Top & bottom fade overlay */}
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/100 to-black/0" />
    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/100 to-black/0" />
  </div>


<motion.section
  initial={{ opacity: 0, y: 100 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.2 }} // 20% of the section must be visible
  transition={{ duration: 1.5 }}
>
  {/* DISCOVER SECTION */}
<section className="relative text-white flex flex-col items-center px-6 py-20 text-center">
  <div className="relative z-10 flex flex-col items-center">
    <h2 className="font-geist text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
      Discover projects, complete quests, campaigns{" "}
      <span className="text-purple-500 font-extrabold">and earn rewards</span>
    </h2>

    <p className="font-geist text-base md:text-lg lg:text-xl text-gray-300 max-w-2xl">
      NEXURA connects users and builders through interactive quests and campaigns
    </p>

    {/* Cards Container */}
<div className="mt-16 w-full flex flex-col sm:flex-row sm:justify-center sm:space-x-6 space-y-6 sm:space-y-0 overflow-x-auto pb-4 items-center">
  
  {/* Card 1 */}
  <motion.div
    className="flex-shrink-0 w-[90%] sm:w-[350px] bg-[#24242F] rounded-[24px] p-6 cursor-pointer"
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 200, damping: 20 }}
  >
    <h3 className="text-white font-geist text-xl font-extrabold pt-1 pb-4">
      Explore The Ecosystem
    </h3>
    <p className="text-gray-300 font-geist text-sm">
      Discover projects, claims, and activities across the Intuition network.
    </p>
  </motion.div>

  {/* Card 2 */}
  <motion.div
    className="flex-shrink-0 w-[90%] sm:w-[350px] bg-[#24242F] rounded-[24px] p-6 cursor-pointer"
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 200, damping: 20 }}
  >
    <h3 className="text-white font-geist text-xl font-extrabold pt-1 pb-4">
      Complete Quests
    </h3>
    <p className="text-gray-300 font-geist text-sm">
      Take part in guided missions that help you learn, test products, verify claims, and support builders.
    </p>
  </motion.div>

  {/* Card 3 */}
  <motion.div
    className="flex-shrink-0 w-[90%] sm:w-[350px] bg-[#24242F] rounded-[24px] p-6 cursor-pointer"
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 200, damping: 20 }}
  >
    <h3 className="text-white font-geist text-xl font-extrabold pt-1 pb-4">
      Earn Rewards
    </h3>
    <p className="text-gray-300 font-geist text-sm">
      Every action earns XP, TRUST and badges that builds your reputation. The more you engage, the higher you climb.
    </p>
  </motion.div>
    </div>
  </div>
</section>
</motion.section>

<motion.section
  initial={{ opacity: 0, y: 100 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.2 }} // 20% of the section must be visible
  transition={{ duration: 1.5 }}
>
<section className="flex flex-col sm:flex-row text-white items-center justify-center px-4 sm:px-0 py-12 sm:py-20">

  {/* Left half image */}
  <div className="flex-1 flex items-center justify-center relative mb-6 sm:mb-0 order-1 sm:order-0">
    {/* Mobile Image */}
    <img
      src="/discover-mobile.png"
      alt="Discover Mobile"
      className="w-full max-w-xs sm:hidden object-contain"
    />

    {/* Desktop Image */}
    <img
      src="/discover-left.png"
      alt="Discover Desktop"
      className="w-full max-w-md hidden sm:block object-contain"
    />
  </div>

  {/* Right half: Text (desktop only) */}
  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center sm:px-6 relative order-0 sm:order-1 mb-8 sm:mb-0">
    <div className="relative z-10">
      <h3 className="font-geist text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white text-center sm:text-right leading-tight">
        <span className="block mb-2">The Engagement</span>
        <span className="block mb-2">Engine for The</span>
        <span className="block">Intuition Ecosystem</span>
      </h3>

      {/* Vertical line */}
      <div
        className="hidden sm:block bg-purple-500 rounded-full absolute sm:right-[-12px] mx-auto sm:mx-0 top-0"
        style={{
          width: "5px",
          height: "40px",
          minHeight: "80px",
        }}
      ></div>
    </div>
  </div>

</section>
</motion.section>

<motion.section
  initial={{ opacity: 0, y: 100 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.2 }} // 20% of the section must be visible
  transition={{ duration: 1.5 }}
>
<section className="relative text-white py-16 sm:py-24 px-4 sm:px-6 overflow-hidden">
  <div className="relative z-10">

    {/* Heading row */}
    <div className="flex items-center justify-start mb-10 sm:mb-12">
      <div className="flex items-start">

        {/* Vertical purple line (desktop emphasis) */}
        <div
          className="bg-purple-500 rounded-full mr-3 sm:mr-4 hidden sm:block"
          style={{
            width: "4px",
            height: "50px",
          }}
        ></div>

        {/* Heading */}
        <h2 className="font-geist text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight text-left">
          Why Nexura Matters
        </h2>
      </div>
    </div>

    {/* Cards row */}
<div className="max-w-7xl mx-auto px-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">

  {/* Card 1 */}
  <motion.div
    className="bg-[#24242F] rounded-2xl p-6 flex flex-col items-center text-center border border-purple-500/100 cursor-pointer mx-auto w-full max-w-[300px] sm:max-w-none"
    whileHover={{ scale: 1.05, borderRadius: "32px" }}
    transition={{ type: "spring", stiffness: 200, damping: 20 }}
  >
    <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full border border-purple-500 flex items-center justify-center mb-6">
      <img
  src="/notebook.png"
  alt="Real Engagement"
  className="w-full h-full object-contain -mb-3 sm:-mb-5"
/>

    </div>

    <h3 className="text-lg sm:text-xl font-bold mb-2">Clear Guidance</h3>
    <p className="text-gray-300 text-sm sm:text-base">
      Helps people understand where to start, what to explore, and how to take meaningful actions in the Intuition ecosystem.
    </p>
  </motion.div>

  {/* Card 2 */}
  <motion.div
    className="bg-[#24242F] rounded-2xl p-6 flex flex-col items-center text-center border border-purple-500/100 cursor-pointer mx-auto w-full max-w-[300px] sm:max-w-none"
    whileHover={{ scale: 1.05, borderRadius: "32px" }}
    transition={{ type: "spring", stiffness: 200, damping: 20 }}
  >
    <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full border border-purple-500 flex items-center justify-center mb-6">
      <img
  src="/engager.png"
  alt="Real Engagement"
  className="w-full h-full object-contain -mb-3 sm:-mb-5"
/>

    </div>

    <h3 className="text-lg sm:text-xl font-bold mb-2">Real Engagement</h3>
    <p className="text-gray-300 text-sm sm:text-base">
      Turns exploration into interactive quests that keep users active, learning, and contributing with purpose.
    </p>
  </motion.div>

  {/* Card 3 */}
  <motion.div
    className="bg-[#24242F] rounded-2xl p-6 flex flex-col items-center text-center border border-purple-500/100 cursor-pointer mx-auto w-full max-w-[300px] sm:max-w-none"
    whileHover={{ scale: 1.05, borderRadius: "32px" }}
    transition={{ type: "spring", stiffness: 200, damping: 20 }}
  >
    <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full border border-purple-500 flex items-center justify-center mb-6">
      <img src="/reward.png" alt="Rewarding Participation" className="w-full h-full object-contain" />
    </div>

    <h3 className="text-lg sm:text-xl font-bold mb-2">Rewarding Participation</h3>
    <p className="text-gray-300 text-sm sm:text-base">
      Every action earns XP, TRUST and badges, giving users a reason to return and helping builders grow with real contributors.
    </p>
  </motion.div>
    </div>
  </div>
</section>
</motion.section>

<motion.section
  initial={{ opacity: 0, y: 100 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.2 }} // 20% of the section must be visible
  transition={{ duration: 1.5 }}
>
<section className="text-white py-20 lg:py-28 px-4 lg:px-6 relative overflow-hidden">
  <div className="relative z-10 max-w-7xl mx-auto">

    {/* Mobile image: shown only on <lg */}
    <img
      src="/built-for-section.png"
      alt="Built For Mobile"
      className="block lg:hidden w-full h-auto object-contain"
    />

    {/* Desktop image: shown only on lg+ */}
    <img
      src="/built-for-desktop.png"
      alt="Built For Desktop"
      className="hidden lg:block w-full h-auto object-contain"
    />

  </div>
</section>
</motion.section>

<motion.section
  initial={{ opacity: 0, y: 100 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.2 }} // 20% of the section must be visible
  transition={{ duration: 1.5 }}
>
{/* CALL TO ACTION SECTION */}
<section
  className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 flex flex-col items-center justify-center text-center text-white"
  style={{
    backgroundImage: "url('/ecosystem-sec.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}
>
  <h2 className="font-geist text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3 sm:mb-4">
    Start Exploring the Intuition Ecosystem
  </h2>

  <p className="text-gray-300 text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-xs sm:max-w-xl md:max-w-2xl">
    Dive into quests & campaigns, earn rewards and grow your reputation
  </p>

<Link href="/discover">
  <motion.button
    className="w-full sm:w-auto px-8 sm:px-12 py-2.5 sm:py-3 rounded-full bg-purple-600 text-white font-semibold text-base sm:text-lg cursor-pointer shadow-md"
    whileHover={{
      scale: 1.08,        // slightly bigger
      rotate: [0, 2, -2, 0], // subtle thinking wobble
      boxShadow: "0 0 20px rgba(124, 58, 237, 0.6)", // glowing effect
    }}
    transition={{
      duration: 0.4,
      ease: "easeInOut",
    }}
  >
    Start Exploring
  </motion.button>
</Link>

</section>
</motion.section>

<motion.section
  initial={{ opacity: 0, y: 100 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.2 }} // 20% of the section must be visible
  transition={{ duration: 1.5 }}
>
{/* FOOTER SECTION */}
<section className="relative w-full overflow-hidden">
  {/* Background image */}
  <img
    src="/footer-sec.png"
    alt="Footer Background"
    className="absolute inset-0 w-full h-full object-cover z-0"
  />

  {/* Dark overlay for readability */}
  <div className="absolute inset-0 bg-black/70 z-10" />

  {/* Content */}
  <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col justify-center items-center text-center">

    {/* Logo row */}
    <div className="flex flex-col sm:flex-row items-center sm:space-x-3 mb-4 sm:mb-6">
      <img src="/nexura-icon.png" alt="Nexura" className="w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-0" />
      <span className="font-geist text-xl sm:text-2xl font-bold text-white">Nexura</span>
    </div>

    {/* Owned by */}
    <p className="text-gray-300 text-xs sm:text-sm mb-1">
      Owned by
    </p>

    {/* Copyright text */}
    <p className="text-gray-400 text-xs sm:text-sm mb-1">
      ©2025 Nexura Ecosystem
    </p>

    {/* All rights reserved */}
    <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">
      All rights reserved
    </p>

    {/* Social icons */}
<div className="flex items-center space-x-4 sm:space-x-6">
  <a
    href="https://x.com/NexuraXYZ"
    target="_blank"
    rel="noopener noreferrer"
    className="cursor-pointer"
  >
    <img
      src="/x-logo-icon.png"
      alt="X"
      className="w-6 h-6 sm:w-8 sm:h-8 opacity-70 hover:opacity-100"
    />
  </a>

  <a
    href="https://discord.gg/bADTCtzyb"
    target="_blank"
    rel="noopener noreferrer"
    className="cursor-pointer"
  >
    <img
      src="/discord-logo-icon.png"
      alt="Discord"
      className="w-6 h-6 sm:w-8 sm:h-8 opacity-70 hover:opacity-100"
    />
  </a>

  <a
    href="https://github.com/intuition-box/nexura-app"
    target="_blank"
    rel="noopener noreferrer"
    className="cursor-pointer"
  >
    <img
      src="/github-logo.png"
      alt="GitHub"
      className="w-6 h-6 sm:w-8 sm:h-8 opacity-70 hover:opacity-100"
    />
  </a>
</div>
  </div>
</section>
</motion.section>
</div>
    </>
  );
}
const NexonSystem = ({ onNext, onPrev }: any) => {
  return (
    <div id="nexon-system docs-top" className="max-w-[59rem]">

      {/* What is a Nexon */}
      <div>
        <h4 id="what-is-a-nexon" className="text-[#8B3EFE] font-medium mt-6">
          What Is A Nexon?
        </h4>

        <p className="text-gray-400 text-sm mt-3">
          A Nexon is an NFT on Nexura that represents a user’s level and progress within the platform.
        </p>

        <p className="text-gray-400 text-sm mt-3">
          XP is used to unlock the ability to mint a Nexon, which represents a user’s level on Nexura. As users earn XP through quests, campaigns, dApp exploration, and lessons, they progress through higher Nexons that reflect their growth and standing within the ecosystem.
        </p>
      </div>

      {/* Path */}
      <div id="the-path-of-the-nexon" className="mt-8">
        <h4 className="text-[#8B3EFE] font-medium">
          The Path of the Nexon
        </h4>

        <div className="text-gray-400 text-sm mt-3 space-y-4">

  <p>
    No one arrives in Nexura already knowing the way. Every explorer starts at the same place, standing at the edge of something vast, with nothing but curiosity and the willingness to take the first step.
  </p>

  <p>
    That first step makes you a <span className="text-white font-semibold">Trial Initiate</span>. You are new here and the realm knows it. The quests are your orientation, not just tasks to complete but signals that tell the ecosystem you are paying attention. Most people stop here, not because the path disappears but because they never look for what comes next.
  </p>

  <p>
    The ones who keep going become <span className="text-white font-semibold">Pathfinders</span>. They have stopped wandering and started moving with direction. They know where the knowledge lives and they go looking for it on purpose.
  </p>

  <p>
    Go deeper and you become a <span className="text-white font-semibold">Scout of Lore</span>, someone who has started to uncover the things that were not meant to be found easily. Fragments. Patterns. Truths that earlier explorers left behind without realizing it. The ecosystem starts to feel less like a place you are visiting and more like one you are beginning to understand.
  </p>

  <p>
    From there the path splits into territory that separates the curious from the committed. <span className="text-white font-semibold">Relic Runners</span> chase what others overlook. <span className="text-white font-semibold">Rune Raiders</span> decode what others cannot read. These are not titles you claim, they are things the ecosystem recognizes in you after you have done the work.
  </p>

  <p>
    Then comes the part where most explorers pause. The vaults are sealed for a reason and the crypts go deeper than most are willing to follow. <span className="text-white font-semibold">Vault Servers</span> do not force their way in. They earn access through understanding. <span className="text-white font-semibold">Crypt Divers</span> go where certainty runs out and keep going anyway, not because they are fearless but because they have learned to trust what they know over what they can see.
  </p>

  <p>
    By the time an explorer reaches <span className="text-white font-semibold text-white">Temple Warden</span>, they have stopped thinking about what the ecosystem can give them. They are protecting it now, holding space for the knowledge they have gathered and making sure others can find their way to it. <span className="text-white font-semibold">Relic Masters</span> go further still, using everything they have uncovered to actively shape what the ecosystem becomes next.
  </p>

  <p>
    And then there are the <span className="text-white font-semibold">Nexon Vanguards</span>.
  </p>

  <p>
    There is no quest that unlocks this rank. No shortcut that leads here. The Vanguard is what the ecosystem calls someone who has shown up consistently, contributed meaningfully, and earned the trust of everyone who has watched them move through every layer of this place. They did not arrive first. They just never stopped proving they belonged.
  </p>

  <p>
    That is the path. It does not end. It only gets deeper.
  </p>

</div>
      </div>

      {/* Progression Model */}
      <div id="nexon-progression-model" className="mt-10">
        <h4 className="text-[#8B3EFE] font-medium">
          Nexon Progression Model
        </h4>

        <p className="text-gray-400 text-sm mt-3">
          A Nexon can also be minted as proof of a user's progress on Nexura. It is a non-tradable NFT that represents a user's reputation and level within the platform.
          Nexura features 10 Nexons, each corresponding to a different level of progression. Below is the list of all Nexons, along with the XP required to unlock each Nexon or level. 
        </p>
      </div>

      {/* Image */}
      <div className="mt-8 flex justify-center">
        <img
          src="/nexonsss-table.png"
          alt="Nexon Progression"
          className="w-full max-w-[52rem]"
        />
      </div>

      {/* Navigation */}
      <div className="mt-10 flex justify-between">

        <div
          onClick={onPrev}
          className="w-[10rem] cursor-pointer border border-white/30 rounded-lg p-2"
        >
          <h4 className="text-[#8B3EFE] text-xs">PREVIOUS</h4>
          <p className="text-gray-400 text-sm mt-2">Getting Started</p>
        </div>

        <div
          onClick={onNext}
          className="w-[10rem] cursor-pointer border border-white/30 rounded-lg p-2 text-right"
        >
          <h4 className="text-[#8B3EFE] text-xs">NEXT</h4>
          <p className="text-gray-400 text-sm mt-2">Nexura Technical Overview</p>
        </div>

      </div>

    </div>
  );
};

export default NexonSystem;
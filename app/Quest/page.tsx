import React from "react";
import Image from "next/image";

const Quest = () => {
  const quests = [
    { id: 1, title: "Claim 100 Points", points: 100 },
    { id: 2, title: "Claim 200 Points", points: 200 },
    { id: 3, title: "Claim 700 Points", points: 700 },
    { id: 4, title: "Claim 1000 Points", points: 1000 },
    { id: 5, title: "Follow on", icon: null },
    { id: 6, title: "Join Discord", icon: "discord" },
    { id: 7, title: "Visit Website", icon: "website" },
  ];

  return (
    <div
      className="min-h-screen max-w-[539px] m-auto  p-8 flex items-center justify-center"
      style={{ fontFamily: "Pixelify Sans, monospace" }}
    >
      <div className="bg-white border-4 border-black rounded-xl shadow-lg w-full max-w-md relative">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b-2 border-black">
          <div className="flex-1 text-center">
            <h2 className="text-5xl font-bold text-black">Quests</h2>
          </div>
          <Image
            src="/images/exitButton.png"
            alt="quest"
            width={50}
            height={50}
          />
        </div>

        {/* Quest List */}
        <div className="p-4 space-y-3">
          {quests.map((quest) => (
            <div key={quest.id} className="flex items-center gap-5">
              {/* Quest Description */}
              <div className="flex-1 bg-white border-2 rounded-md border-black p-3 flex items-center gap-2">
                <span className="text-black text-3xl font-medium">
                  {quest.title}
                </span>
                {quest.icon === "discord" && (
                  <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                  </div>
                )}
                {quest.icon === "website" && (
                  <div className="w-6 h-6 border-2 border-black bg-white rounded-full flex items-center justify-center">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="black"
                    >
                      <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm0 2c1.95 0 3.737.56 5.26 1.526L15.414 5.38C14.42 4.52 13.25 4 12 4s-2.42.52-3.414 1.38L6.74 3.526C8.263 2.56 10.05 2 12 2zm-6.146 3.44l1.846 1.847C7.252 8.42 7 9.18 7 10h-2c0-1.39.33-2.7.854-3.86zM5 12H3c0-1.39.33-2.7.854-3.86L5.7 9.287C5.252 10.42 5 11.68 5 12zm.854 3.86C5.33 14.7 5 13.39 5 12h2c0 1.82.252 2.58.7 3.713L5.854 15.86zm2.886.654C9.58 17.48 10.75 18 12 18s2.42-.52 3.414-1.38l1.846 1.847C15.737 19.44 13.95 20 12 20s-3.737-.56-5.26-1.526l1.846-1.847zM19 12h-2c0-.82-.252-1.58-.7-2.713l1.846-1.847C18.67 8.6 19 9.91 19 12zm-.854-3.86L16.3 9.287C16.748 8.42 17 7.18 17 6h2c0 1.39-.33 2.7-.854 3.86z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Claim Button */}
              <button
                className=" border-b-8 border-2 rounded-l-lg  border-black px-4 py-3 text-xl font-bold text-black transition-colors min-w-[80px]"
                style={{ borderStyle: "outset" }}
              >
                Claim
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Quest;

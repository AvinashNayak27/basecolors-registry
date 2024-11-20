import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { useWriteContract } from "wagmi";
import { baseSepolia } from "viem/chains";
import { useReadContract } from "wagmi";

export default function App() {
  const { address } = useAccount();
  const [userNfts, setUserNfts] = useState([]);
  const [primaryColor, setPrimaryColor] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState(null);
  const [textColor, setTextColor] = useState(null);
  const [activeTab, setActiveTab] = useState("primary");

  const [currentColors, setCurrentColors] = useState(null);

  const basecolorsRegistryContractAddress =
    "0xaD8CdD14E2f80a50A750335538654740fE3Cb8F8";

  const abiForGetColorFunction = [
    {
      inputs: [
        {
          internalType: "address",
          name: "user",
          type: "address",
        },
      ],
      name: "getColors",
      outputs: [
        {
          internalType: "string",
          name: "primaryColor",
          type: "string",
        },
        {
          internalType: "string",
          name: "backgroundColor",
          type: "string",
        },
        {
          internalType: "string",
          name: "textColor",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];

  const { data: colors } = useReadContract({
    address: basecolorsRegistryContractAddress,
    abi: abiForGetColorFunction,
    functionName: "getColors",
    args: [address],
  });

  useEffect(() => {
    if (colors) {
      console.log(colors);
      setCurrentColors(colors);
    }
  }, [colors]);

  const { data: hash, writeContractAsync } = useWriteContract();

  const abiForSetColorFunction = [
    {
      inputs: [
        {
          internalType: "string",
          name: "primaryColor",
          type: "string",
        },
        {
          internalType: "string",
          name: "backgroundColor",
          type: "string",
        },
        {
          internalType: "string",
          name: "textColor",
          type: "string",
        },
      ],
      name: "setColors",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  const baseColorsContractAddress =
    "0x70F19D04b867431A316D070fa58a22dF02a89c86";
  const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY;

  const fetchUserNfts = async () => {
    const response = await fetch(
      `https://base-sepolia.g.alchemy.com/nft/v2/${alchemyApiKey}/getNFTs?owner=${address}&contractAddresses[]=${baseColorsContractAddress}&withMetadata=true&pageSize=100`
    );
    const data = await response.json();
    console.log(data);
    setUserNfts(data.ownedNfts);
  };

  const handleColorSelect = (title, colorType) => {
    switch (colorType) {
      case "primary":
        setPrimaryColor(title);
        break;
      case "background":
        setBackgroundColor(title);
        break;
      case "text":
        setTextColor(title);
        break;
    }
  };

  const handleSubmitColors = async () => {
    console.log({
      primaryColor,
      backgroundColor,
      textColor,
    });
    await writeContractAsync({
      address: basecolorsRegistryContractAddress,
      abi: abiForSetColorFunction,
      functionName: "setColors",
      args: [primaryColor, backgroundColor, textColor],
      chain: baseSepolia,
    });

    alert("Colors submitted");
  };

  useEffect(() => {
    if (!address) return;
    fetchUserNfts();
  }, [address]);

  useEffect(() => {
    if (primaryColor && backgroundColor && textColor) {
      console.log({
        primaryColor,
        backgroundColor,
        textColor,
      });
    }
  }, [primaryColor, backgroundColor, textColor]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center space-y-6 p-4">
      <ConnectKitButton />

      {address && (
        <>
          <p className="text-lg text-gray-600 font-medium bg-white px-4 py-2 rounded-md shadow-sm">
            Address: <span className="font-mono text-blue-600">{address}</span>
          </p>

          {currentColors && (
            <div
              className="mb-6 p-6 rounded-lg"
            style={{ backgroundColor: currentColors?.[1] || "#ffffff" }}
          >
            <div
              className="p-4 rounded-md"
              style={{ backgroundColor: currentColors?.[0] || "#ffffff" }}
            >
              <p
                className="text-lg font-medium"
                style={{ color: currentColors?.[2] || "#000000" }}
              >
                Preview of Your Current Color Scheme
              </p>
              <p
                className="text-sm"
                style={{ color: currentColors?.[2] || "#000000" }}
              >
                This is your current color scheme. You can change it by
                selecting new colors.
              </p>
            </div>
            </div>
          )}

          <div className="w-full max-w-3xl bg-white rounded-lg shadow-sm p-6">
            {/* Tab Headers */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {["primary", "background", "text"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    py-3 px-4 text-center rounded-md font-medium capitalize transition-all
                    ${
                      activeTab === tab
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }
                  `}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Color Grid */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              {userNfts.map((nft) => (
                <button
                  key={nft.tokenId}
                  onClick={() => handleColorSelect(nft.title, activeTab)}
                  className={`
                    relative w-full aspect-square rounded-md transition-all hover:scale-105
                    ${
                      activeTab === "primary" && primaryColor === nft.title
                        ? "ring-4 ring-blue-500"
                        : ""
                    }
                    ${
                      activeTab === "background" &&
                      backgroundColor === nft.title
                        ? "ring-4 ring-blue-500"
                        : ""
                    }
                    ${
                      activeTab === "text" && textColor === nft.title
                        ? "ring-4 ring-blue-500"
                        : ""
                    }
                  `}
                >
                  <img
                    src={nft.media[0].thumbnail}
                    alt={nft.title}
                    className="w-full h-full object-cover rounded-md"
                  />
                </button>
              ))}
            </div>

            {/* Selected Colors Display */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-500 mb-1">Primary</p>
                <p className="font-medium">{primaryColor || "Not selected"}</p>
              </div>
              <div className="flex-1 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-500 mb-1">Background</p>
                <p className="font-medium">
                  {backgroundColor || "Not selected"}
                </p>
              </div>
              <div className="flex-1 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-500 mb-1">Text</p>
                <p className="font-medium">{textColor || "Not selected"}</p>
              </div>
            </div>

            {/* Color Preview */}
            <div
              className="mb-6 p-6 rounded-lg"
              style={{ backgroundColor: backgroundColor || "#ffffff" }}
            >
              <div
                className="p-4 rounded-md"
                style={{ backgroundColor: primaryColor || "#f3f4f6" }}
              >
                <p
                  className="text-lg font-medium"
                  style={{ color: textColor || "#000000" }}
                >
                  Preview of Your Color Scheme
                </p>
                <p
                  className="text-sm"
                  style={{ color: textColor || "#000000" }}
                >
                  This is how your selected colors will look together
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleSubmitColors}
                className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Submit Colors
              </button>
            </div>
          </div>
          {hash && (
            <p className="text-sm text-gray-500">
              Transaction hash:{" "}
              <a
                href={`https://sepolia.basescan.org/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-blue-600"
              >
                {hash}
              </a>
            </p>
          )}
        </>
      )}
    </div>
  );
}

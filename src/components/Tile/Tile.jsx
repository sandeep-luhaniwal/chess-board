import "./Tile.css";

export default function Tile({ number, image, highlight }) {
  const className = ["tile w-[100px] h-[100px] grid  place-content-center",
    number % 2 === 0 && "black-tile bg-[#75a83e]",
    number % 2 !== 0 && "white-tile bg-[#a1a192]",
    highlight && "tile-highlight",
    image && "chess-piece-tile w-[100px]"].filter(Boolean).join(' ');


  return (
    <div className={className}>
      {image && <div style={{ backgroundImage: `url(${image})` }} className="chess-piece active:cursor-grabbing hover:cursor-grab w-[100px] h-[100px] bg-no-repeat"></div>}
    </div>
  );
}
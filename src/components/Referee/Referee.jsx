import { useRef, useState, useEffect } from "react";
import { initialBoard } from "../../Constants";
import { Piece } from "../../models";
import {
    bishopMove,
    kingMove,
    knightMove,
    pawnMove,
    queenMove,
    rookMove
} from "../../referee/rules";
import { PieceType, TeamType } from "../../Types";
import Boardchess from "../Boardchess/Boardchess";

export default function Referee() {
    const [board, setBoard] = useState(initialBoard.clone());
    const [promotionPawn, setPromotionPawn] = useState();
    const modalRef = useRef(null);
    const checkmateModalRef = useRef(null);
    const [whiteMoves, setWhiteMoves] = useState([]); // List of White moves
    const [blackMoves, setBlackMoves] = useState([]); // List of Black moves
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0); // Track the current move index
    const [timer, setTimer] = useState(90); // Timer in seconds
    const [activePlayer, setActivePlayer] = useState(TeamType.OUR); // Track the active player
    const [moveHistory, setMoveHistory] = useState([]); // Array to hold move history

    useEffect(() => {
        const countdown = setInterval(() => {
            if (timer > 0) {
                setTimer((prev) => prev - 1);
            } else {
                handleTimeOut();
            }
        }, 1000);
        return () => clearInterval(countdown);
    }, [timer]);

    function handleTimeOut() {
        console.log(`Time's up for ${activePlayer === TeamType.OUR ? "White" : "Black"}!`);
        const randomMove = getRandomMove();
        if (randomMove) {
            playMove(randomMove.piece, randomMove.destination);
        }
        switchActivePlayer(); // Switch player after auto-move
    }

    function getRandomMove() {
        const validMoves = board.pieces
            .filter(piece => piece.team === activePlayer && piece.possibleMoves && piece.possibleMoves.length > 0)
            .flatMap(piece => piece.possibleMoves.map(move => ({ piece, destination: move })));

        if (validMoves.length === 0) return null;

        const sortedMoves = validMoves.sort((a, b) => {
            const piecePriority = {
                [PieceType.PAWN]: 1,
                [PieceType.KNIGHT]: 2,
                [PieceType.BISHOP]: 3,
                [PieceType.ROOK]: 4,
                [PieceType.QUEEN]: 5,
                [PieceType.KING]: 6
            };
            return piecePriority[a.piece.type] - piecePriority[b.piece.type];
        });

        return sortedMoves[0];
    }

    function playMove(playedPiece, destination) {
        // Check if the active player is trying to move their own piece
        if (playedPiece.team !== activePlayer) {
            alert(activePlayer === TeamType.OUR ? "Illegal move! It's White's turn." : "Illegal move! It's Black's turn.");
            return false;
        }

        // Continue the move if it's a valid move
        if (playedPiece.possibleMoves === undefined) return false;

        // Ensure that White's moves happen on odd turns and Black's moves on even turns
        if (playedPiece.team === TeamType.OUR && board.totalTurns % 2 !== 1) return false;
        if (playedPiece.team === TeamType.OPPONENT && board.totalTurns % 2 !== 0) return false;

        let playedMoveIsValid = false;
        const validMove = playedPiece.possibleMoves?.some((m) => m.samePosition(destination));

        if (!validMove) {
            alert("Illegal move!");
            return false;
        }

        const enPassantMove = isEnPassantMove(
            playedPiece.position,
            destination,
            playedPiece.type,
            playedPiece.team
        );

        setBoard((prevBoard) => {
            const clonedBoard = prevBoard.clone();
            clonedBoard.totalTurns += 1; // Increment the total number of turns
            playedMoveIsValid = clonedBoard.playMove(enPassantMove, validMove, playedPiece, destination);

            if (playedMoveIsValid) {
                const playerLabel = playedPiece.team === TeamType.OUR ? "White" : "Black";
                const turnNumber = clonedBoard.totalTurns; // Correct turn number
                const moveNotation = `Turn ${turnNumber - 1}: ${playerLabel} - ${playedPiece.type} from (${playedPiece.position.x}, ${playedPiece.position.y}) to (${destination.x}, ${destination.y})`;

                // Update the move history only if it's a valid move
                setMoveHistory((prevHistory) => {
                    if (!prevHistory.includes(moveNotation)) { // Check if the move is already in history
                        return [...prevHistory, moveNotation]; // Append the new move if not present
                    }
                    return prevHistory; // Return the existing history if the move is a duplicate
                });
            }

            // Check if there's a checkmate
            if (clonedBoard.winningTeam !== undefined) {
                checkmateModalRef.current?.classList.remove("none");
                alert(`Checkmate! The winning team is ${clonedBoard.winningTeam === TeamType.OUR ? "White" : "Black"}!`);
            }

            return clonedBoard;
        });

        // Handle pawn promotion
        if (destination.y === (playedPiece.team === TeamType.OUR ? 7 : 0) && playedPiece.isPawn) {
            modalRef.current?.classList.remove("none");
            setPromotionPawn(() => {
                const clonedPlayedPiece = playedPiece.clone();
                clonedPlayedPiece.position = destination.clone();
                return clonedPlayedPiece;
            });
        }

        switchActivePlayer(); // Switch player after the move
        return playedMoveIsValid;
    }


    function switchActivePlayer() {
        setActivePlayer((prev) => (prev === TeamType.OUR ? TeamType.OPPONENT : TeamType.OUR));
        resetTimer();
        setCurrentMoveIndex((prev) => prev + 1); // Move to the next move in history
    }

    function resetTimer() {
        setTimer(90);
    }

    function isEnPassantMove(initialPosition, desiredPosition, typeType, team) {
        const pawnDirection = team === TeamType.OUR ? 1 : -1;

        if (typeType === PieceType.PAWN) {
            if (
                (desiredPosition.x - initialPosition.x === -1 ||
                    desiredPosition.x - initialPosition.x === 1) &&
                desiredPosition.y - initialPosition.y === pawnDirection
            ) {
                const piece = board.pieces.find(
                    (p) =>
                        p.position.x === desiredPosition.x &&
                        p.position.y === desiredPosition.y - pawnDirection &&
                        p.isPawn &&
                        p.enPassant
                );
                if (piece) {
                    return true;
                }
            }
        }

        return false;
    }

    function promotePawn(pieceTypeType) {
        if (promotionPawn === undefined) {
            return;
        }

        setBoard(() => {
            const clonedBoard = board.clone();
            clonedBoard.pieces = clonedBoard.pieces.reduce((results, piece) => {
                if (piece.samePiecePosition(promotionPawn)) {
                    results.push(
                        new Piece(
                            piece.position.clone(),
                            pieceTypeType,
                            piece.team,
                            true
                        )
                    );
                } else {
                    results.push(piece);
                }
                return results;
            }, []);
            clonedBoard.calculateAllMoves();
            return clonedBoard;
        });

        modalRef.current?.classList.add("none");
    }

    function promotionTeamType() {
        return promotionPawn?.team === TeamType.OUR ? "white" : "black";
    }

    function restartGame() {
        checkmateModalRef.current?.classList.add("none");
        setBoard(initialBoard.clone());
        setWhiteMoves([]); // Reset White move history
        setBlackMoves([]); // Reset Black move history
        setMoveHistory([]); // Reset move history
        resetTimer();
        setActivePlayer(TeamType.OUR);
        setCurrentMoveIndex(0); // Reset current move index
    }

    return (
        <>
            <div className="flex gap-7 pb-3">
                <p className="text-white text-xl leading-none">
                    Total turns: {board.totalTurns}
                </p>
                <p className="text-white text-xl leading-none">
                    Timer: {timer}
                </p>

                <p className="text-white text-xl leading-none">
                    Active Player: {activePlayer === TeamType.OUR ? "White" : "Black"}
                </p>
            </div>
            <div className="modal none" ref={modalRef}>
                <div className="modal-body">
                    <img
                        onClick={() => promotePawn(PieceType.ROOK)}
                        src={`/assets/images/rook_${promotionTeamType()}.png`}
                    />
                    <img
                        onClick={() => promotePawn(PieceType.BISHOP)}
                        src={`/assets/images/bishop_${promotionTeamType()}.png`}
                    />
                    <img
                        onClick={() => promotePawn(PieceType.KNIGHT)}
                        src={`/assets/images/knight_${promotionTeamType()}.png`}
                    />
                    <img
                        onClick={() => promotePawn(PieceType.QUEEN)}
                        src={`/assets/images/queen_${promotionTeamType()}.png`}
                    />
                </div>
            </div>
            <div className="modal none" ref={checkmateModalRef}>
                <div className="modal-body">
                    <h1>CHECKMATE!</h1>
                    <button onClick={restartGame}>Play Again</button>
                </div>
            </div>
            <Boardchess playMove={playMove} pieces={board.pieces} />
            <div className="fixed end-2 w-[400px] top-5 ">
                <p className="text-white text-2xl text-center">
                    Move History:
                </p>
                <div className="text-white text-xl max-h-[90vh] overflow-auto hidden-scoll">
                    {moveHistory.slice().reverse().map((move, index) => (
                        <div key={index}>{move}</div>
                    ))}
                </div>

            </div>
        </>
    );
}

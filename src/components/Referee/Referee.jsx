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
    const [whiteMove, setWhiteMove] = useState(""); // Latest White move
    const [blackMove, setBlackMove] = useState(""); // Latest Black move
    const [timer, setTimer] = useState(10); // Timer in seconds
    const [activePlayer, setActivePlayer] = useState(TeamType.OUR); // Track the active player

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
        if (playedPiece.possibleMoves === undefined) return false;

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

        setBoard(() => {
            const clonedBoard = board.clone();
            clonedBoard.totalTurns += 1;
            playedMoveIsValid = clonedBoard.playMove(enPassantMove, validMove, playedPiece, destination);

            if (playedMoveIsValid) {
                const playerLabel = playedPiece.team === TeamType.OUR ? "White" : "Black";
                const moveNotation = `${playerLabel}: ${playedPiece.type} from (${playedPiece.position.x}, ${playedPiece.position.y}) to (${destination.x}, ${destination.y})`;

                if (playedPiece.team === TeamType.OUR) {
                    setWhiteMove(moveNotation); // Update White's latest move
                } else {
                    setBlackMove(moveNotation); // Update Black's latest move
                }
            }

            if (clonedBoard.winningTeam !== undefined) {
                checkmateModalRef.current?.classList.remove("none");
                alert(`Checkmate! The winning team is ${clonedBoard.winningTeam === TeamType.OUR ? "White" : "Black"}!`);
            }

            return clonedBoard;
        });

        if (destination.y === (playedPiece.team === TeamType.OUR ? 7 : 0) && playedPiece.isPawn) {
            modalRef.current?.classList.remove("none");
            setPromotionPawn(() => {
                const clonedPlayedPiece = playedPiece.clone();
                clonedPlayedPiece.position = destination.clone();
                return clonedPlayedPiece;
            });
        }

        switchActivePlayer();
        return playedMoveIsValid;
    }

    function switchActivePlayer() {
        setActivePlayer((prev) => (prev === TeamType.OUR ? TeamType.OPPONENT : TeamType.OUR));
        resetTimer();
    }

    function resetTimer() {
        setTimer(10);
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
        setWhiteMove(""); // Reset White move history
        setBlackMove(""); // Reset Black move history
        resetTimer();
        setActivePlayer(TeamType.OUR);
    }

    return (
        <>
            <p style={{ color: "white", fontSize: "24px", textAlign: "center" }}>
                Total turns: {board.totalTurns}
            </p>
            <p style={{ color: "white", fontSize: "24px", textAlign: "center" }}>
                Timer: {timer}
            </p>
            <p style={{ color: "white", fontSize: "24px", textAlign: "center" }}>
                Move History:
            </p>

            <p className="text-white">
                Active Player: {activePlayer === TeamType.OUR ? "White" : "Black"}
            </p>
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
            <div>
                <ul style={{ color: "white", fontSize: "20px" }}>
                    <li>{whiteMove}</li> {/* Display latest White move */}
                    <li>{blackMove}</li> {/* Display latest Black move */}
                </ul>
            </div>
        </>
    );
}

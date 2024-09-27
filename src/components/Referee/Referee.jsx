import { useRef, useState } from "react";
import { initialBoard } from "../../Constants";
import { Piece } from "../../models";
import { Board } from "../../models/Board";
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

    function playMove(playedPiece, destination) {
        // If the playing piece doesn't have any moves return
        if (playedPiece.possibleMoves === undefined) return false;

        // Prevent the inactive team from playing
        if (
            playedPiece.team === TeamType.OUR &&
            board.totalTurns % 2 !== 1
        )
            return false;
        if (
            playedPiece.team === TeamType.OPPONENT &&
            board.totalTurns % 2 !== 0
        )
            return false;

        let playedMoveIsValid = false;

        const validMove = playedPiece.possibleMoves?.some((m) =>
            m.samePosition(destination)
        );

        if (!validMove) return false;

        const enPassantMove = isEnPassantMove(
            playedPiece.position,
            destination,
            playedPiece.type,
            playedPiece.team
        );

        // playMove modifies the board thus we
        // need to call setBoard
        setBoard(() => {
            const clonedBoard = board.clone();
            clonedBoard.totalTurns += 1;
            // Playing the move
            playedMoveIsValid = clonedBoard.playMove(
                enPassantMove,
                validMove,
                playedPiece,
                destination
            );

            if (clonedBoard.winningTeam !== undefined) {
                checkmateModalRef.current?.classList.remove("hidden");
            }

            return clonedBoard;
        });

        // This is for promoting a pawn
        let promotionRow = playedPiece.team === TeamType.OUR ? 7 : 0;

        if (destination.y === promotionRow && playedPiece.isPawn) {
            modalRef.current?.classList.remove("hidden");
            setPromotionPawn(() => {
                const clonedPlayedPiece = playedPiece.clone();
                clonedPlayedPiece.position = destination.clone();
                return clonedPlayedPiece;
            });
        }

        return playedMoveIsValid;
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

    //TODO
    //Add stalemate!
    function isValidMove(initialPosition, desiredPosition, typeType, team) {
        let validMove = false;
        switch (typeType) {
            case PieceType.PAWN:
                validMove = pawnMove(
                    initialPosition,
                    desiredPosition,
                    team,
                    board.pieces
                );
                break;
            case PieceType.KNIGHT:
                validMove = knightMove(
                    initialPosition,
                    desiredPosition,
                    team,
                    board.pieces
                );
                break;
            case PieceType.BISHOP:
                validMove = bishopMove(
                    initialPosition,
                    desiredPosition,
                    team,
                    board.pieces
                );
                break;
            case PieceType.ROOK:
                validMove = rookMove(
                    initialPosition,
                    desiredPosition,
                    team,
                    board.pieces
                );
                break;
            case PieceType.QUEEN:
                validMove = queenMove(
                    initialPosition,
                    desiredPosition,
                    team,
                    board.pieces
                );
                break;
            case PieceType.KING:
                validMove = kingMove(
                    initialPosition,
                    desiredPosition,
                    team,
                    board.pieces
                );
        }

        return validMove;
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

        modalRef.current?.classList.add("hidden");
    }

    function promotionTeamType() {
        return promotionPawn?.team === TeamType.OUR ? "w" : "b";
    }

    function restartGame() {
        checkmateModalRef.current?.classList.add("hidden");
        setBoard(initialBoard.clone());
    }

    return (
        <>
            <p className="text-white text-2xl text-center py-5"
              
            >
                Total turns: {board.totalTurns}
            </p>
            <div className="modal absolute top-0 right-0 left-0 bottom-0 hidden" ref={modalRef}>
                <div className="modal-body absolute top-[calc(50%-150px) left-[calc(50%-400px)] flex items-center justify-around h-[300px] w-[800px] bg-green-800">
                    <img className="h-[120px] hover:cursor-pointer bg-green-900 p-5 rounded-[50%]"
                        onClick={() => promotePawn(PieceType.ROOK)}
                        src={`/assets/images/rook_${promotionTeamType()}.png`}
                    />
                    <img className="h-[120px] hover:cursor-pointer bg-green-900 p-5 rounded-[50%]"
                        onClick={() => promotePawn(PieceType.BISHOP)}
                        src={`/assets/images/bishop_${promotionTeamType()}.png`}
                    />
                    <img className="h-[120px] hover:cursor-pointer bg-green-900 p-5 rounded-[50%]"
                        onClick={() => promotePawn(PieceType.KNIGHT)}
                        src={`/assets/images/knight_${promotionTeamType()}.png`}
                    />
                    <img className="h-[120px] hover:cursor-pointer bg-green-900 p-5 rounded-[50%]"
                        onClick={() => promotePawn(PieceType.QUEEN)}
                        src={`/assets/images/queen_${promotionTeamType()}.png`}
                    />
                </div>
            </div>
            <div className="modal absolute top-0 right-0 left-0 bottom-0 hidden" ref={checkmateModalRef}>
                <div className="modal-body absolute top-[calc(50%-150px) left-[calc(50%-400px)] flex items-center justify-around h-[300px] w-[800px] bg-green-800">
                    <div className="checkmate-body flex flex-col gap-12">
                        <span className="text-[32px]">
                            The winning team is{" "}
                            {board.winningTeam === TeamType.OUR
                                ? "white"
                                : "black"}
                            !
                        </span>
                        <button className="bg-[#779556] border-none rounded-md py-6 px-12 hover:cursor-pointer text-[32px] text-white" onClick={restartGame}>Play again</button>
                    </div>
                </div>
            </div>
            <Boardchess playMove={playMove} pieces={board.pieces} />
        </>
    );
}

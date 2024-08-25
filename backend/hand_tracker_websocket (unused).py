import cv2
import mediapipe as mp
from math_func import *

import asyncio
import websockets
import numpy as np
import base64


def get_gesture(hand_landmarks):

    lm = {
        "wrist": hand_landmarks.landmark[mp.solutions.hands.HandLandmark.WRIST],
        "thumb_cmc": hand_landmarks.landmark[mp.solutions.hands.HandLandmark.THUMB_CMC],
        "thumb_mcp": hand_landmarks.landmark[mp.solutions.hands.HandLandmark.THUMB_MCP],
        "thumb_ip": hand_landmarks.landmark[mp.solutions.hands.HandLandmark.THUMB_IP],
        "thumb_tip": hand_landmarks.landmark[mp.solutions.hands.HandLandmark.THUMB_TIP],
        "index_mcp": hand_landmarks.landmark[
            mp.solutions.hands.HandLandmark.INDEX_FINGER_MCP
        ],
        "index_pip": hand_landmarks.landmark[
            mp.solutions.hands.HandLandmark.INDEX_FINGER_PIP
        ],
        "index_dip": hand_landmarks.landmark[
            mp.solutions.hands.HandLandmark.INDEX_FINGER_DIP
        ],
        "index_tip": hand_landmarks.landmark[
            mp.solutions.hands.HandLandmark.INDEX_FINGER_TIP
        ],
        "middle_mcp": hand_landmarks.landmark[
            mp.solutions.hands.HandLandmark.MIDDLE_FINGER_MCP
        ],
        "middle_pip": hand_landmarks.landmark[
            mp.solutions.hands.HandLandmark.MIDDLE_FINGER_PIP
        ],
        "middle_dip": hand_landmarks.landmark[
            mp.solutions.hands.HandLandmark.MIDDLE_FINGER_DIP
        ],
        "middle_tip": hand_landmarks.landmark[
            mp.solutions.hands.HandLandmark.MIDDLE_FINGER_TIP
        ],
        "ring_mcp": hand_landmarks.landmark[
            mp.solutions.hands.HandLandmark.RING_FINGER_MCP
        ],
        "ring_pip": hand_landmarks.landmark[
            mp.solutions.hands.HandLandmark.RING_FINGER_PIP
        ],
        "ring_dip": hand_landmarks.landmark[
            mp.solutions.hands.HandLandmark.RING_FINGER_DIP
        ],
        "ring_tip": hand_landmarks.landmark[
            mp.solutions.hands.HandLandmark.RING_FINGER_TIP
        ],
        "pinky_mcp": hand_landmarks.landmark[mp.solutions.hands.HandLandmark.PINKY_MCP],
        "pinky_pip": hand_landmarks.landmark[mp.solutions.hands.HandLandmark.PINKY_PIP],
        "pinky_dip": hand_landmarks.landmark[mp.solutions.hands.HandLandmark.PINKY_DIP],
        "pinky_tip": hand_landmarks.landmark[mp.solutions.hands.HandLandmark.PINKY_TIP],
    }

    threshold = max(
        [
            dist2D(lm["index_mcp"], lm["pinky_mcp"]),
            dist2D(lm["pinky_mcp"], lm["wrist"]),
            dist2D(lm["wrist"], lm["thumb_cmc"]),
            dist2D(lm["thumb_cmc"], lm["index_mcp"]),
        ]
    )

    if (
        check_inside(lm["wrist"], lm["middle_tip"], lm["middle_pip"])
        and check_inside(lm["wrist"], lm["ring_tip"], lm["ring_pip"])
        and check_inside(lm["wrist"], lm["pinky_tip"], lm["pinky_pip"])
    ):
        if not check_inside(lm["index_pip"], lm["index_tip"], lm["index_mcp"]):
            # if check_inside(lm["wrist"], lm["thumb_tip"], lm["index_mcp"]):
            if (
                dist3D(lm["thumb_tip"], lm["middle_pip"]) < threshold / 2
                or dist3D(lm["thumb_tip"], lm["middle_dip"]) < threshold / 2
            ):
                return "point_on"
            else:
                return "point_off"
        else:
            return "clench"
    return "none"


async def receive_frames(websocket, path):
    try:
        # Initialize MediaPipe Hands
        mp_hands = mp.solutions.hands
        hands = mp_hands.Hands()

        # Initialize MediaPipe Drawing module for drawing landmarks
        mp_drawing = mp.solutions.drawing_utils

        while True:
            # Receive base64-encoded frame
            frame_base64 = await websocket.recv()
            
            # print(frame_base64)

            # Decode base64 to bytes
            frame_data = base64.b64decode(frame_base64)

            # Convert the received data to a numpy array
            frame_array = np.frombuffer(frame_data, dtype=np.uint8)

            # Decode the JPEG frame
            frame = cv2.imdecode(frame_array, cv2.IMREAD_COLOR)

            # Convert the BGR image to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            # Process the frame and get hand landmarks
            results = hands.process(rgb_frame)

            # Draw hand landmarks on the frame if detected
            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    mp_drawing.draw_landmarks(
                        frame, hand_landmarks, mp_hands.HAND_CONNECTIONS
                    )

                    cv2.putText(
                        frame,
                        get_gesture(hand_landmarks),
                        (50, 100),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        1,
                        (0, 255, 0),
                        2,
                        cv2.LINE_AA,
                    )

            # Send the encoded frame to the client
            # Convert the frame to JPEG format
            _, encoded_frame = cv2.imencode(".jpg", frame)
            # Display the resulting frame
            cv2.imshow("Hand Gesture Recognition", frame)

            # Send the JPEG frame to the client
            await websocket.send(encoded_frame.tobytes())

            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

        cv2.destroyAllWindows()

    except websockets.exceptions.ConnectionClosed:
        print("Connection with WebSocket client closed.")


start_server = websockets.serve(receive_frames, "localhost", 8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()

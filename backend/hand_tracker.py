"""
Python program to recognize hand gestures from a live stream using OpenCV and mp.tasks.vision.GestureRecognizer.
"""

import cv2
import mediapipe as mp
from math_func import *


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


def value(hand_landmarks):

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
            dist3D(lm["index_mcp"], lm["pinky_mcp"]),
            dist3D(lm["pinky_mcp"], lm["wrist"]),
            dist3D(lm["wrist"], lm["thumb_cmc"]),
            dist3D(lm["thumb_cmc"], lm["index_mcp"]),
        ]
    )

    return str(threshold)


def main():
    # Initialize MediaPipe Hands
    mp_hands = mp.solutions.hands
    hands = mp_hands.Hands()

    # Initialize MediaPipe Drawing module for drawing landmarks
    mp_drawing = mp.solutions.drawing_utils

    # Capture video from default camera (index 0)
    cap = cv2.VideoCapture(0)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Flip the frame horizontally for a later selfie-view display
        frame = cv2.flip(frame, 1)

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
                
        # Display the resulting frame
        cv2.imshow("Hand Gesture Recognition", frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    # Release the VideoCapture object and destroy windows
    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()

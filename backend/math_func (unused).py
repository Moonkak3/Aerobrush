class Vector:
    def __init__(self, x, y, z=0):
        self.x = x
        self.y = y
        self.z = z


def dist2D(landmark1, landmark2, root=True):
    value = (landmark1.x - landmark2.x) ** 2 + (landmark1.y - landmark2.y) ** 2
    if root:
        value = value**0.5
    return value


def dist3D(landmark1, landmark2, root=True):
    value = (
        (landmark1.x - landmark2.x) ** 2
        + (landmark1.y - landmark2.y) ** 2
        + (landmark1.z - landmark2.z) ** 2
    )
    if root:
        value = value**0.5
    return value


def dot3D(landmark1, landmark2):
    return (
        landmark1.x * landmark2.x
        + landmark1.y * landmark2.y
        + landmark1.z * landmark2.z
    )


def dot2D(landmark1, landmark2):
    return landmark1.x * landmark2.x + landmark1.y * landmark2.y


# checks if point B is within the boundaries of A and C
# i.e. The projection of AB onto AC is less than the length of AC
# and vice versa
def check_inside(A, B, C):
    AB = Vector(B.x - A.x, B.y - A.y)
    CB = Vector(B.x - C.x, B.y - C.y)
    AC = Vector(C.x - A.x, C.y - A.y)
    AC2 = dist2D(A, C, False)

    if abs(dot2D(AB, AC)) > AC2 or abs(dot2D(CB, AC)) > AC2:
        return False
    else:
        return True


def main():
    # Create some sample landmarks
    print(
        check_inside(
            Vector(0.5, 0.5),
            Vector(0.3, 0.5),
            Vector(0.6, 0.5),
        )
    )


if __name__ == "__main__":
    main()

import Shape from "./Shape";

export default interface Interactable extends Shape {
    interact: () => void
}
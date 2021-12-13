import Shape from "./Shape";

export default interface Interactable extends Shape {
    toggle: () => void
    canInteract: boolean
}
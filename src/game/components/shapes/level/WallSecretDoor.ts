import { Vec2, Vec3 } from '../../utils'
import Config from '../../Config'
import Wall from './Wall'
import Interactable from './Interactable'
import Camera from '../../Camera'
import audio from "../../../sounds/WSND0015.wav"
import BetterAudio from '../../BetterAudio'
import UI from '../ui/UI'


export default class WallSecretDoor extends Wall implements Interactable {
    canInteract = true
    dirToCalculate = false

    private dir: Vec3
    private opening = false
    private openingSpeed = Config.gridSize * 0.7
    audio = new BetterAudio(audio)

    toggle() {
        if (!this.opening) {
            this.opening = true
            UI.instance.secretsFound++
            this.audio.play()
        }
    }

    update(deltaTime: number, camera: Camera) {
        if (this.opening) {
            if (this.dirToCalculate) {
                this.calculateDir(camera)
            }
            this.transform.position = this.transform.position.add(this.dir.multiply(deltaTime * this.openingSpeed))
            if (this.initialTransform.position.distanceTo(this.transform.position) >= Config.gridSize * 2) {
                this.opening = false
                this.canInteract = false
            }
        }
    }

    calculateDir(camera: Camera) {
        this.dir = Vec3.fromAngle(this.transform.rotation.y)
        const toCamera = camera.transform.position.substract(this.transform.position)
        if ((this.dir.x > 0 && toCamera.x > 0) || (this.dir.x < 0 && toCamera.x < 0)) {
            this.dir.x = -this.dir.x
        }
        if ((this.dir.z > 0 && toCamera.z > 0) || (this.dir.z < 0 && toCamera.z < 0)) {
            this.dir.z = -this.dir.z
        }
        this.dirToCalculate = false
    }
}
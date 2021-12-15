import Camera from '../../../Camera'
import UI from '../../ui/UI'
import Pickup from './Pickup'
import audio from "../../../../sounds/P_LIFE.wav"
import BetterAudio from '../../../BetterAudio'

export default class PowerUp extends Pickup {
    textureNumber = 56
    audio = new BetterAudio(audio)
    onPickedUp(camera: Camera) {
        UI.instance.health = 100
        UI.instance.ammo += 25
        UI.instance.lives++
    }
}
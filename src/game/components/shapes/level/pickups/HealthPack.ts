import HealthItem from './HealthItem'
import audio from "../../../../sounds/P_MEDKIT.wav"
import BetterAudio from '../../../BetterAudio'

export default class HealthPack extends HealthItem {
    healthRestored = 25
    textureNumber = 42
    audio = new BetterAudio(audio)
}
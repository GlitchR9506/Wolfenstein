import HealthItem from './HealthItem'
import audio from "../../../../sounds/P_FOOD.wav"
import BetterAudio from '../../../BetterAudio'

export default class Food extends HealthItem {
    healthRestored = 10
    textureNumber = 41
    audio = new BetterAudio(audio)
}
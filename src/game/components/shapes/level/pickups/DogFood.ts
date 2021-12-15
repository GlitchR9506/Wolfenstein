import HealthItem from './HealthItem'
import audio from "../../../../sounds/P_FOOD.wav"
import BetterAudio from '../../../BetterAudio'

export default class DogFood extends HealthItem {
    healthRestored = 4
    textureNumber = 11
    audio = new BetterAudio(audio)
}
import PointItem from './PointItem'
import audio from "../../../../sounds/T_CROWN.wav"
import BetterAudio from '../../../BetterAudio'

export default class GoldenCrown extends PointItem {
    textureNumber = 52
    givenScore = 5000
    audio = new BetterAudio(audio)
}
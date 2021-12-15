import PointItem from './PointItem'
import audio from "../../../../sounds/T_CROSS.wav"
import BetterAudio from '../../../BetterAudio'

export default class GoldenCross extends PointItem {
    textureNumber = 49
    givenScore = 100
    audio = new BetterAudio(audio)
}
import PointItem from './PointItem'
import audio from "../../../../sounds/T_CUP.wav"
import BetterAudio from '../../../BetterAudio'

export default class GoldenCup extends PointItem {
    textureNumber = 50
    givenScore = 500
    audio = new BetterAudio(audio)
}
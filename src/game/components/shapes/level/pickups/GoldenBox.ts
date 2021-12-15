import PointItem from './PointItem'
import audio from "../../../../sounds/T_CHEST.wav"
import BetterAudio from '../../../BetterAudio'

export default class GoldenBox extends PointItem {
    textureNumber = 51
    givenScore = 1000
    audio = new BetterAudio(audio)
}
import PropTypes from 'prop-types';
import { ImageProps, ViewStyle, StyleProp, ImageStyle, ImageURISource } from 'react-native';
import { LightboxProps } from 'react-native-lightbox-v2';
import { IMessage } from './Models';
export interface MessageImageProps<TMessage extends IMessage> {
    currentMessage?: TMessage;
    containerStyle?: StyleProp<ViewStyle>;
    imageSourceProps?: Partial<ImageURISource>;
    imageStyle?: StyleProp<ImageStyle>;
    imageProps?: Partial<ImageProps>;
    lightboxProps?: LightboxProps;
}
export declare function MessageImage<TMessage extends IMessage = IMessage>({ containerStyle, lightboxProps, imageProps, imageSourceProps, imageStyle, currentMessage, }: MessageImageProps<TMessage>): JSX.Element | null;
export declare namespace MessageImage {
    var propTypes: {
        currentMessage: PropTypes.Requireable<object>;
        containerStyle: PropTypes.Requireable<number | boolean | object>;
        imageSourceProps: PropTypes.Requireable<object>;
        imageStyle: PropTypes.Requireable<number | boolean | object>;
        imageProps: PropTypes.Requireable<object>;
        lightboxProps: PropTypes.Requireable<object>;
    };
}

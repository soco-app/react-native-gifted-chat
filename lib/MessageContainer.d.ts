import React, { RefObject } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { LoadEarlierProps } from './LoadEarlier';
import Message from './Message';
import { User, IMessage, Reply } from './Models';
import { FlashList, FlashListProps } from '@shopify/flash-list';
export interface MessageContainerProps<TMessage extends IMessage> {
    messages?: TMessage[];
    isTyping?: boolean;
    user?: User;
    listViewProps?: Partial<FlashListProps<TMessage>>;
    inverted?: boolean;
    loadEarlier?: boolean;
    alignTop?: boolean;
    scrollToBottom?: boolean;
    scrollToBottomStyle?: StyleProp<ViewStyle>;
    invertibleScrollViewProps?: any;
    extraData?: any;
    scrollToBottomOffset?: number;
    forwardRef?: RefObject<FlashList<IMessage>>;
    renderChatEmpty?(): React.ReactNode;
    renderFooter?(props: MessageContainerProps<TMessage>): React.ReactNode;
    renderMessage?(props: Message['props']): React.ReactNode;
    renderLoadEarlier?(props: LoadEarlierProps): React.ReactNode;
    scrollToBottomComponent?(): React.ReactNode;
    onLoadEarlier?(): void;
    onQuickReply?(replies: Reply[]): void;
    infiniteScroll?: boolean;
    isLoadingEarlier?: boolean;
}
declare const MessageContainer: <TMessage extends IMessage = IMessage>(props: MessageContainerProps<TMessage>) => JSX.Element;
export default MessageContainer;
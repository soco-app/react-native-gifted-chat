import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform, } from 'react-native';
import { LoadEarlier } from './LoadEarlier';
import Message from './Message';
import Color from './Color';
import TypingIndicator from './TypingIndicator';
import { warning } from './logging';
import { FlashList } from '@shopify/flash-list';
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    containerAlignTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    contentContainerStyle: {
    // flexGrow: 1,
    // justifyContent: 'flex-start',
    },
    emptyChatContainer: {
        flex: 1,
        transform: [{ scaleY: -1 }],
    },
    headerWrapper: {
        flex: 1,
    },
    scrollToBottomStyle: {
        opacity: 0.8,
        position: 'absolute',
        right: 10,
        bottom: 30,
        zIndex: 999,
        height: 40,
        width: 40,
        borderRadius: 20,
        backgroundColor: Color.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Color.black,
        shadowOpacity: 0.5,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 1,
    },
});
const MessageContainer = (props) => {
    const { messages = [], user = {}, isTyping = false, renderChatEmpty = null, renderFooter = null, renderMessage = null, onLoadEarlier = () => { }, onQuickReply = () => { }, inverted = true, loadEarlier = false, listViewProps = {}, invertibleScrollViewProps = {}, extraData = null, scrollToBottom = false, scrollToBottomOffset = 200, alignTop = false, infiniteScroll = false, isLoadingEarlier = false, ...restProps } = props;
    const [showScrollBottom, setShowScrollBottom] = useState(false);
    const [hasScrolled, setHasScrolled] = useState(false);
    const flatListRef = props.forwardRef || useRef(null);
    const scrollTo = (options) => {
        var _a;
        (_a = flatListRef.current) === null || _a === void 0 ? void 0 : _a.scrollToOffset(options);
    };
    const scrollToBottomWithInvertedCheck = (animated = true) => {
        var _a;
        if (inverted) {
            scrollTo({ offset: 0, animated });
        }
        else {
            (_a = flatListRef.current) === null || _a === void 0 ? void 0 : _a.scrollToEnd({ animated });
        }
    };
    const handleOnScroll = (event) => {
        const { nativeEvent: { contentOffset: { y: contentOffsetY }, contentSize: { height: contentSizeHeight }, layoutMeasurement: { height: layoutMeasurementHeight }, }, } = event;
        if (inverted) {
            if (contentOffsetY > scrollToBottomOffset) {
                setShowScrollBottom(true);
                setHasScrolled(true);
            }
            else {
                setShowScrollBottom(false);
                setHasScrolled(true);
            }
        }
        else {
            if (contentOffsetY < scrollToBottomOffset &&
                contentSizeHeight - layoutMeasurementHeight > scrollToBottomOffset) {
                setShowScrollBottom(true);
                setHasScrolled(true);
            }
            else {
                setShowScrollBottom(false);
                setHasScrolled(true);
            }
        }
    };
    const renderTypingIndicator = () => {
        if (Platform.OS === 'web') {
            return null;
        }
        return <TypingIndicator isTyping={isTyping}/>;
    };
    const renderFooterView = () => {
        if (renderFooter) {
            return renderFooter(props);
        }
        return renderTypingIndicator();
    };
    const renderLoadEarlier = () => {
        if (loadEarlier === true) {
            const loadEarlierProps = {
                ...props,
            };
            if (props.renderLoadEarlier) {
                return props.renderLoadEarlier(loadEarlierProps);
            }
            return <LoadEarlier {...loadEarlierProps}/>;
        }
        return null;
    };
    const renderRow = ({ item, index }) => {
        if (!item._id && item._id !== 0) {
            warning('GiftedChat: `_id` is missing for message', JSON.stringify(item));
        }
        if (!item.user) {
            if (!item.system) {
                warning('GiftedChat: `user` is missing for message', JSON.stringify(item));
            }
            item.user = { _id: 0 };
        }
        if (messages && messages.length > 0 && user) {
            const previousMessage = (inverted ? messages[index + 1] : messages[index - 1]) || {};
            const nextMessage = (inverted ? messages[index - 1] : messages[index + 1]) || {};
            const messageProps = {
                ...restProps,
                // @ts-expect-error
                user,
                key: item._id,
                currentMessage: item,
                previousMessage,
                inverted,
                nextMessage,
                // @ts-expect-error
                position: item.user._id === user._id ? 'right' : 'left',
            };
            if (renderMessage) {
                return renderMessage(messageProps);
            }
            return <Message {...messageProps}/>;
        }
        return null;
    };
    const renderChatEmptyView = () => {
        if (renderChatEmpty) {
            return inverted ? (renderChatEmpty()) : (<View style={styles.emptyChatContainer}>{renderChatEmpty()}</View>);
        }
        return <View style={styles.container}/>;
    };
    const renderHeaderWrapper = () => (<View style={styles.headerWrapper}>{renderLoadEarlier()}</View>);
    const renderScrollBottomComponent = () => {
        const { scrollToBottomComponent } = props;
        if (scrollToBottomComponent) {
            return scrollToBottomComponent();
        }
        return <Text>V</Text>;
    };
    const renderScrollToBottomWrapper = () => {
        const propsStyle = props.scrollToBottomStyle || {};
        return (<View style={[styles.scrollToBottomStyle, propsStyle]}>
        <TouchableOpacity onPress={() => scrollToBottomWithInvertedCheck()} hitSlop={{ top: 5, left: 5, right: 5, bottom: 5 }}>
          {renderScrollBottomComponent()}
        </TouchableOpacity>
      </View>);
    };
    const onLayoutList = () => {
        if (!inverted && !!messages && messages.length) {
            setTimeout(() => scrollToBottomWithInvertedCheck(false), 15 * messages.length);
        }
    };
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                func(...args);
            }, delay);
        };
    };
    const onEndReached = () => {
        if (infiniteScroll &&
            hasScrolled &&
            loadEarlier &&
            onLoadEarlier &&
            !isLoadingEarlier &&
            Platform.OS !== 'web') {
            onLoadEarlier();
        }
    };
    const debouncedOnEndReached = useCallback(debounce(onEndReached, 200), [
        onEndReached,
    ]);
    // const keyExtractor = (item: TMessage) =>
    //   `message-${item._id}${item.createdAt ? String(item.createdAt) : ''}${
    //     item.text ? item.text.substring(0, 10) : ''
    //   }`
    const keyExtractor = (item) => `message-${item._id}`;
    return (<View style={alignTop ? styles.containerAlignTop : styles.container}>
      <FlashList ref={flatListRef} extraData={[extraData, isTyping]} keyExtractor={keyExtractor} enableEmptySections automaticallyAdjustContentInsets={false} inverted={inverted} data={messages} 
    // style={styles.listStyle}
    contentContainerStyle={styles.contentContainerStyle} renderItem={renderRow} {...invertibleScrollViewProps} ListEmptyComponent={renderChatEmptyView} ListFooterComponent={inverted ? renderHeaderWrapper : renderFooter} ListHeaderComponent={inverted ? renderFooterView : renderHeaderWrapper} onScroll={handleOnScroll} scrollEventThrottle={16} onLayout={onLayoutList} onEndReached={debouncedOnEndReached} onEndReachedThreshold={0.1} estimatedItemSize={200} {...listViewProps}/>
      {showScrollBottom && scrollToBottom
            ? renderScrollToBottomWrapper()
            : null}
    </View>);
};
export default MessageContainer;
//# sourceMappingURL=MessageContainer.js.map
import PropTypes from 'prop-types'
import React, { useState, useRef, RefObject } from 'react'

import {
  FlatList,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleProp,
  ViewStyle,
  Platform,
  ListRenderItemInfo,
  ListViewProps,
} from 'react-native'

import { LoadEarlier, LoadEarlierProps } from './LoadEarlier'
import Message from './Message'
import Color from './Color'
import { User, IMessage, Reply } from './Models'
import TypingIndicator from './TypingIndicator'

import { StylePropType } from './utils'
import { warning } from './logging'

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerAlignTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  contentContainerStyle: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  emptyChatContainer: {
    flex: 1,
    transform: [{ scaleY: -1 }],
  },
  headerWrapper: {
    flex: 1,
  },
  listStyle: {
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
})

export interface MessageContainerProps<TMessage extends IMessage> {
  messages?: TMessage[]
  isTyping?: boolean
  user?: User
  listViewProps: Partial<ListViewProps>
  inverted?: boolean
  loadEarlier?: boolean
  alignTop?: boolean
  scrollToBottom?: boolean
  scrollToBottomStyle?: StyleProp<ViewStyle>
  invertibleScrollViewProps?: any
  extraData?: any
  scrollToBottomOffset?: number
  forwardRef?: RefObject<FlatList<IMessage>>
  renderChatEmpty?(): React.ReactNode
  renderFooter?(props: MessageContainerProps<TMessage>): React.ReactNode
  renderMessage?(props: Message['props']): React.ReactNode
  renderLoadEarlier?(props: LoadEarlierProps): React.ReactNode
  scrollToBottomComponent?(): React.ReactNode
  onLoadEarlier?(): void
  onQuickReply?(replies: Reply[]): void
  infiniteScroll?: boolean
  isLoadingEarlier?: boolean
}

const MessageContainer = <TMessage extends IMessage = IMessage>(
  props: MessageContainerProps<TMessage>,
) => {
  const [showScrollBottom, setShowScrollBottom] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const flatListRef = props.forwardRef || useRef<FlatList<IMessage>>(null)

  const scrollTo = (options: { animated?: boolean; offset: number }) => {
    flatListRef.current?.scrollToOffset(options)
  }

  const scrollToBottom = (animated = true) => {
    const { inverted } = props
    if (inverted) {
      scrollTo({ offset: 0, animated })
    } else {
      flatListRef.current?.scrollToEnd({ animated })
    }
  }

  const handleOnScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {
      nativeEvent: {
        contentOffset: { y: contentOffsetY },
        contentSize: { height: contentSizeHeight },
        layoutMeasurement: { height: layoutMeasurementHeight },
      },
    } = event
    const { scrollToBottomOffset } = props
    if (props.inverted) {
      if (contentOffsetY > scrollToBottomOffset!) {
        setShowScrollBottom(true)
        setHasScrolled(true)
      } else {
        setShowScrollBottom(false)
        setHasScrolled(true)
      }
    } else {
      if (
        contentOffsetY < scrollToBottomOffset! &&
        contentSizeHeight - layoutMeasurementHeight > scrollToBottomOffset!
      ) {
        setShowScrollBottom(true)
        setHasScrolled(true)
      } else {
        setShowScrollBottom(false)
        setHasScrolled(true)
      }
    }
  }

  const renderTypingIndicator = () => {
    if (Platform.OS === 'web') {
      return null
    }
    return <TypingIndicator isTyping={props.isTyping || false} />
  }

  const renderFooter = () => {
    if (props.renderFooter) {
      return props.renderFooter(props)
    }
    return renderTypingIndicator()
  }

  const renderLoadEarlier = () => {
    if (props.loadEarlier === true) {
      const loadEarlierProps = {
        ...props,
      }
      if (props.renderLoadEarlier) {
        return props.renderLoadEarlier(loadEarlierProps)
      }
      return <LoadEarlier {...loadEarlierProps} />
    }
    return null
  }

  const renderRow = ({ item, index }: ListRenderItemInfo<TMessage>) => {
    if (!item._id && item._id !== 0) {
      warning('GiftedChat: `_id` is missing for message', JSON.stringify(item))
    }
    if (!item.user) {
      if (!item.system) {
        warning(
          'GiftedChat: `user` is missing for message',
          JSON.stringify(item),
        )
      }
      item.user = { _id: 0 }
    }
    const { messages, user, inverted, ...restProps } = props
    if (messages && user) {
      const previousMessage =
        (inverted ? messages[index + 1] : messages[index - 1]) || {}
      const nextMessage =
        (inverted ? messages[index - 1] : messages[index + 1]) || {}

      const messageProps: Message['props'] = {
        ...restProps,
        user,
        key: item._id,
        currentMessage: item,
        previousMessage,
        inverted,
        nextMessage,
        position: item.user._id === user._id ? 'right' : 'left',
      }

      if (props.renderMessage) {
        return props.renderMessage(messageProps)
      }
      return <Message {...messageProps} />
    }
    return null
  }

  const renderChatEmpty = () => {
    if (props.renderChatEmpty) {
      return props.inverted ? (
        props.renderChatEmpty()
      ) : (
        <View style={styles.emptyChatContainer}>{props.renderChatEmpty()}</View>
      )
    }
    return <View style={styles.container} />
  }

  const renderHeaderWrapper = () => (
    <View style={styles.headerWrapper}>{renderLoadEarlier()}</View>
  )

  const renderScrollBottomComponent = () => {
    const { scrollToBottomComponent } = props
    if (scrollToBottomComponent) {
      return scrollToBottomComponent()
    }
    return <Text>V</Text>
  }

  const renderScrollToBottomWrapper = () => {
    const propsStyle = props.scrollToBottomStyle || {}
    return (
      <View style={[styles.scrollToBottomStyle, propsStyle]}>
        <TouchableOpacity
          onPress={() => scrollToBottom()}
          hitSlop={{ top: 5, left: 5, right: 5, bottom: 5 }}
        >
          {renderScrollBottomComponent()}
        </TouchableOpacity>
      </View>
    )
  }

  const onLayoutList = () => {
    if (!props.inverted && !!props.messages && props.messages!.length) {
      setTimeout(() => scrollToBottom(false), 15 * props.messages!.length)
    }
  }

  const onEndReached = ({ distanceFromEnd }: { distanceFromEnd: number }) => {
    const {
      loadEarlier,
      onLoadEarlier,
      infiniteScroll,
      isLoadingEarlier,
    } = props
    if (
      infiniteScroll &&
      (hasScrolled || distanceFromEnd > 0) &&
      distanceFromEnd <= 100 &&
      loadEarlier &&
      onLoadEarlier &&
      !isLoadingEarlier &&
      Platform.OS !== 'web'
    ) {
      onLoadEarlier()
    }
  }

  const keyExtractor = (item: TMessage) => `${item._id}`

  return (
    <View style={props.alignTop ? styles.containerAlignTop : styles.container}>
      <FlatList
        ref={flatListRef}
        extraData={[props.extraData, props.isTyping]}
        keyExtractor={keyExtractor}
        enableEmptySections
        automaticallyAdjustContentInsets={false}
        inverted={props.inverted}
        data={props.messages}
        style={styles.listStyle}
        contentContainerStyle={styles.contentContainerStyle}
        renderItem={renderRow}
        {...props.invertibleScrollViewProps}
        ListEmptyComponent={renderChatEmpty}
        ListFooterComponent={
          props.inverted ? renderHeaderWrapper : renderFooter
        }
        ListHeaderComponent={
          props.inverted ? renderFooter : renderHeaderWrapper
        }
        onScroll={handleOnScroll}
        scrollEventThrottle={100}
        onLayout={onLayoutList}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.1}
        {...props.listViewProps}
      />
      {showScrollBottom && props.scrollToBottom
        ? renderScrollToBottomWrapper()
        : null}
    </View>
  )
}

MessageContainer.defaultProps = {
  messages: [],
  user: {},
  isTyping: false,
  renderChatEmpty: null,
  renderFooter: null,
  renderMessage: null,
  onLoadEarlier: () => {},
  onQuickReply: () => {},
  inverted: true,
  loadEarlier: false,
  listViewProps: {},
  invertibleScrollViewProps: {},
  extraData: null,
  scrollToBottom: false,
  scrollToBottomOffset: 200,
  alignTop: false,
  scrollToBottomStyle: {},
  infiniteScroll: false,
  isLoadingEarlier: false,
}

MessageContainer.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.object),
  isTyping: PropTypes.bool,
  user: PropTypes.object,
  renderChatEmpty: PropTypes.func,
  renderFooter: PropTypes.func,
  renderMessage: PropTypes.func,
  renderLoadEarlier: PropTypes.func,
  onLoadEarlier: PropTypes.func,
  listViewProps: PropTypes.object,
  inverted: PropTypes.bool,
  loadEarlier: PropTypes.bool,
  invertibleScrollViewProps: PropTypes.object,
  extraData: PropTypes.object,
  scrollToBottom: PropTypes.bool,
  scrollToBottomOffset: PropTypes.number,
  scrollToBottomComponent: PropTypes.func,
  alignTop: PropTypes.bool,
  scrollToBottomStyle: StylePropType,
  infiniteScroll: PropTypes.bool,
}

export default MessageContainer

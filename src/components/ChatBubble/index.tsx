import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface ChatBubbleProps {
  content: string;
  isUser: boolean;
  time?: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ content, isUser, time }) => {
  return (
    <View className={classnames(styles.bubbleWrap, isUser ? styles.userWrap : styles.aiWrap)}>
      {!isUser && <View className={styles.aiAvatar}><Text className={styles.aiAvatarText}>AI</Text></View>}
      <View className={classnames(styles.bubble, isUser ? styles.userBubble : styles.aiBubble)}>
        <Text className={classnames(styles.content, isUser ? styles.userContent : styles.aiContent)}>
          {content}
        </Text>
      </View>
      {time && <Text className={styles.time}>{time}</Text>}
    </View>
  );
};

export default ChatBubble;
